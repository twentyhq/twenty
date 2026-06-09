import { type CoreApiClient } from 'twenty-client-sdk/core';

import { buildErrorResult } from 'src/logic-functions/utils/build-error-result';
import { buildMatchedResult } from 'src/logic-functions/utils/build-matched-result';
import { buildNotFoundResult } from 'src/logic-functions/utils/build-not-found-result';
import { buildSkippedResult } from 'src/logic-functions/utils/build-skipped-result';
import { INTERNAL_BOOKKEEPING_FIELDS } from 'src/logic-functions/utils/internal-field-names';
import { isWithinTtl } from 'src/logic-functions/utils/is-within-ttl';
import { nowIso } from 'src/logic-functions/utils/now-iso';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
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
}: {
  client: CoreApiClient;
  recordIds: string[];
  input: BulkEnrichInput;
  adapter: BatchEnrichmentAdapter<TNode, TData, TParams>;
  resultById: Map<string, EnrichResult>;
}): Promise<void> => {
  let nodes: TNode[];
  try {
    nodes = await adapter.readRecords({ client, recordIds });
  } catch (error) {
    const message = toErrorMessage(error);
    for (const recordId of recordIds) {
      resultById.set(recordId, buildErrorResult({ recordId, error: message }));
    }

    return;
  }

  const nodeById = new Map(nodes.map((node) => [adapter.getNodeId(node), node]));

  const toEnrich: { recordId: string; node: TNode; params: TParams }[] = [];
  for (const recordId of recordIds) {
    const node = nodeById.get(recordId);
    if (!isDefined(node)) {
      resultById.set(
        recordId,
        buildErrorResult({
          recordId,
          error: `${adapter.objectNameSingular} ${recordId} not found`,
        }),
      );
      continue;
    }

    if (
      input.force !== true &&
      isWithinTtl({ lastEnrichedAt: adapter.getLastEnrichedAt(node) })
    ) {
      resultById.set(
        recordId,
        buildSkippedResult({
          recordId,
          message: 'Recently enriched; skipped (use force to re-run).',
        }),
      );
      continue;
    }

    const params = adapter.extractParams({ node, input });
    if (!isDefined(params)) {
      resultById.set(
        recordId,
        buildSkippedResult({
          recordId,
          message: adapter.noIdentifierMessage,
        }),
      );
      continue;
    }

    toEnrich.push({ recordId, node, params });
  }

  if (toEnrich.length === 0) {
    return;
  }

  const enrichedAt = nowIso();
  const recordIdsToMarkAsError: string[] = [];

  let outcomes: PdlEnrichResult<TData>[];
  try {
    outcomes = await adapter.enrichBatch(toEnrich.map((entry) => entry.params));
  } catch (error) {
    const message = toErrorMessage(error);
    for (const entry of toEnrich) {
      resultById.set(
        entry.recordId,
        buildErrorResult({ recordId: entry.recordId, error: message }),
      );
    }
    await writeErrorStatusWithBackoff({
      adapter,
      client,
      recordIds: toEnrich.map((entry) => entry.recordId),
      enrichedAt,
    });

    return;
  }

  const notFoundIds: string[] = [];
  const matched: { recordId: string; data: Record<string, unknown> }[] = [];

  for (let index = 0; index < toEnrich.length; index++) {
    const { recordId, node } = toEnrich[index];
    const outcome = outcomes[index];

    if (!isDefined(outcome) || outcome.outcome === 'error') {
      const message = isDefined(outcome)
        ? outcome.message
        : 'People Data Labs returned no response for this record.';
      resultById.set(recordId, buildErrorResult({ recordId, error: message }));
      recordIdsToMarkAsError.push(recordId);
      continue;
    }

    if (outcome.outcome === 'not_found') {
      notFoundIds.push(recordId);
      continue;
    }

    try {
      const data = await adapter.buildMatchedData({
        client,
        node,
        outcome,
        enrichedAt,
      });
      matched.push({ recordId, data });
    } catch (error) {
      resultById.set(
        recordId,
        buildErrorResult({ recordId, error: toErrorMessage(error) }),
      );
      recordIdsToMarkAsError.push(recordId);
    }
  }

  if (matched.length > 0) {
    const settled = await Promise.allSettled(
      matched.map((entry) =>
        adapter.updateOne({
          client,
          recordId: entry.recordId,
          data: entry.data,
        }),
      ),
    );

    settled.forEach((outcome, index) => {
      const entry = matched[index];
      if (outcome.status === 'fulfilled') {
        resultById.set(
          entry.recordId,
          buildMatchedResult({
            recordId: entry.recordId,
            updatedFields: Object.keys(entry.data).filter(
              (key) => !INTERNAL_BOOKKEEPING_FIELDS.has(key),
            ),
          }),
        );
      } else {
        resultById.set(
          entry.recordId,
          buildErrorResult({
            recordId: entry.recordId,
            error: toErrorMessage(outcome.reason),
          }),
        );
        recordIdsToMarkAsError.push(entry.recordId);
      }
    });
  }

  if (notFoundIds.length > 0) {
    try {
      await adapter.updateManyStatus({
        client,
        recordIds: notFoundIds,
        data: {
          pdlEnrichmentStatus: 'NOT_FOUND',
          pdlLastEnrichedAt: enrichedAt,
        },
      });
      for (const recordId of notFoundIds) {
        resultById.set(recordId, buildNotFoundResult(recordId));
      }
    } catch (error) {
      const message = toErrorMessage(error);
      for (const recordId of notFoundIds) {
        resultById.set(recordId, buildErrorResult({ recordId, error: message }));
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
