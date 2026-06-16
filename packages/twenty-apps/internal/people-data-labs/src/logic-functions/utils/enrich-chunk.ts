import { type CoreApiClient } from 'twenty-client-sdk/core';

import { buildErrorResult } from 'src/logic-functions/utils/build-error-result';
import { buildMatchedResult } from 'src/logic-functions/utils/build-matched-result';
import { buildNotFoundResult } from 'src/logic-functions/utils/build-not-found-result';
import { buildSkippedResult } from 'src/logic-functions/utils/build-skipped-result';
import { chargeMatchedEnrichments } from 'src/logic-functions/utils/charge-matched-enrichments';
import { INTERNAL_BOOKKEEPING_FIELDS } from 'src/logic-functions/utils/internal-field-names';
import { nowIso } from 'src/logic-functions/utils/now-iso';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type CompanyIdByMatchKeyCache } from 'src/types/company-id-by-match-key-cache';
import { type EnrichResult } from 'src/types/enrich-result';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { isDefined } from 'src/utils/is-defined';
import { toErrorMessage } from 'src/utils/to-error-message';

const writeErrorStatusWithBackoff = async <TNode, TData, TParams>({
  adapter,
  client,
  recordIds,
  enrichedAt,
}: {
  adapter: BatchEnrichmentAdapter<TNode, TData, TParams>;
  client: CoreApiClient;
  recordIds: string[];
  enrichedAt: string;
}): Promise<void> => {
  if (recordIds.length === 0) {
    return;
  }

  await adapter
    .updateManyStatus({
      client,
      recordIds,
      data: { pdlEnrichmentStatus: 'ERROR', pdlLastEnrichedAt: enrichedAt },
    })
    .catch(() => undefined);
};

export const enrichChunk = async <TNode, TData, TParams>({
  client,
  recordIds,
  input,
  adapter,
  resultById,
  companyIdByMatchKeyCache,
}: {
  client: CoreApiClient;
  recordIds: string[];
  input: BulkEnrichInput;
  adapter: BatchEnrichmentAdapter<TNode, TData, TParams>;
  resultById: Map<string, EnrichResult>;
  companyIdByMatchKeyCache: CompanyIdByMatchKeyCache;
}): Promise<void> => {
  let recordNodes: TNode[];
  try {
    recordNodes = await adapter.readRecords({ client, recordIds });
  } catch (readError) {
    const readErrorMessage = toErrorMessage(readError);
    for (const recordId of recordIds) {
      resultById.set(
        recordId,
        buildErrorResult({ recordId, error: readErrorMessage }),
      );
    }

    return;
  }

  const nodeByRecordId = new Map(
    recordNodes.map((recordNode) => [adapter.getNodeId(recordNode), recordNode]),
  );

  const recordsToEnrich: { recordId: string; node: TNode; params: TParams }[] =
    [];
  for (const recordId of recordIds) {
    const recordNode = nodeByRecordId.get(recordId);
    if (!isDefined(recordNode)) {
      resultById.set(
        recordId,
        buildErrorResult({
          recordId,
          error: `${adapter.objectNameSingular} ${recordId} not found`,
        }),
      );
      continue;
    }

    const matchParams = adapter.extractParams({ node: recordNode, input });
    if (!isDefined(matchParams)) {
      resultById.set(
        recordId,
        buildSkippedResult({
          recordId,
          message: adapter.noIdentifierMessage,
        }),
      );
      continue;
    }

    recordsToEnrich.push({ recordId, node: recordNode, params: matchParams });
  }

  if (recordsToEnrich.length === 0) {
    return;
  }

  const enrichedAt = nowIso();
  const recordIdsToMarkAsError: string[] = [];

  let pdlEnrichmentOutcomes: PdlEnrichResult<TData>[];
  try {
    pdlEnrichmentOutcomes = await adapter.enrichBatch(
      recordsToEnrich.map((recordToEnrich) => recordToEnrich.params),
    );
  } catch (enrichBatchError) {
    const enrichBatchErrorMessage = toErrorMessage(enrichBatchError);
    for (const recordToEnrich of recordsToEnrich) {
      resultById.set(
        recordToEnrich.recordId,
        buildErrorResult({
          recordId: recordToEnrich.recordId,
          error: enrichBatchErrorMessage,
        }),
      );
    }
    await writeErrorStatusWithBackoff({
      adapter,
      client,
      recordIds: recordsToEnrich.map((recordToEnrich) => recordToEnrich.recordId),
      enrichedAt,
    });

    return;
  }

  await chargeMatchedEnrichments({
    matchedCount: pdlEnrichmentOutcomes.filter(
      (enrichmentOutcome) => enrichmentOutcome?.outcome === 'matched',
    ).length,
    costPerMatchDollars: adapter.costPerMatchDollars,
    resourceContext: `pdl/${adapter.objectNameSingular.toLowerCase()}`,
  });

  const notFoundRecordIds: string[] = [];
  const matchedRecordsToPersist: {
    recordId: string;
    data: Record<string, unknown>;
  }[] = [];

  for (let index = 0; index < recordsToEnrich.length; index++) {
    const { recordId, node: recordNode } = recordsToEnrich[index];
    const enrichmentOutcome = pdlEnrichmentOutcomes[index];

    if (!isDefined(enrichmentOutcome) || enrichmentOutcome.outcome === 'error') {
      const enrichmentErrorMessage = isDefined(enrichmentOutcome)
        ? enrichmentOutcome.message
        : 'People Data Labs returned no response for this record.';
      resultById.set(
        recordId,
        buildErrorResult({ recordId, error: enrichmentErrorMessage }),
      );
      recordIdsToMarkAsError.push(recordId);
      continue;
    }

    if (enrichmentOutcome.outcome === 'not_found') {
      notFoundRecordIds.push(recordId);
      continue;
    }

    try {
      const matchedRecordData = await adapter.buildMatchedData({
        client,
        node: recordNode,
        outcome: enrichmentOutcome,
        enrichedAt,
        companyIdByMatchKeyCache,
        overrideExistingValues: input.overrideExistingValues === true,
      });
      matchedRecordsToPersist.push({ recordId, data: matchedRecordData });
    } catch (buildMatchedDataError) {
      resultById.set(
        recordId,
        buildErrorResult({
          recordId,
          error: toErrorMessage(buildMatchedDataError),
        }),
      );
      recordIdsToMarkAsError.push(recordId);
    }
  }

  if (matchedRecordsToPersist.length > 0) {
    const settledWriteResults = await Promise.allSettled(
      matchedRecordsToPersist.map((matchedRecord) =>
        adapter.updateOne({
          client,
          recordId: matchedRecord.recordId,
          data: matchedRecord.data,
        }),
      ),
    );

    settledWriteResults.forEach((writeResult, index) => {
      const matchedRecord = matchedRecordsToPersist[index];
      if (writeResult.status === 'fulfilled') {
        resultById.set(
          matchedRecord.recordId,
          buildMatchedResult({
            recordId: matchedRecord.recordId,
            updatedFields: Object.keys(matchedRecord.data).filter(
              (fieldName) => !INTERNAL_BOOKKEEPING_FIELDS.has(fieldName),
            ),
          }),
        );
      } else {
        resultById.set(
          matchedRecord.recordId,
          buildErrorResult({
            recordId: matchedRecord.recordId,
            error: toErrorMessage(writeResult.reason),
          }),
        );
        recordIdsToMarkAsError.push(matchedRecord.recordId);
      }
    });
  }

  if (notFoundRecordIds.length > 0) {
    try {
      await adapter.updateManyStatus({
        client,
        recordIds: notFoundRecordIds,
        data: {
          pdlEnrichmentStatus: 'NOT_FOUND',
          pdlLastEnrichedAt: enrichedAt,
        },
      });
      for (const recordId of notFoundRecordIds) {
        resultById.set(recordId, buildNotFoundResult(recordId));
      }
    } catch (notFoundStatusWriteError) {
      const notFoundStatusWriteErrorMessage = toErrorMessage(
        notFoundStatusWriteError,
      );
      for (const recordId of notFoundRecordIds) {
        resultById.set(
          recordId,
          buildErrorResult({
            recordId,
            error: notFoundStatusWriteErrorMessage,
          }),
        );
        recordIdsToMarkAsError.push(recordId);
      }
    }
  }

  await writeErrorStatusWithBackoff({
    adapter,
    client,
    recordIds: recordIdsToMarkAsError,
    enrichedAt,
  });
};
