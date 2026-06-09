import { type CoreApiClient } from 'twenty-client-sdk/core';

import { buildErrorResult } from 'src/logic-functions/utils/build-error-result';
import { buildMatchedResult } from 'src/logic-functions/utils/build-matched-result';
import { buildNotFoundResult } from 'src/logic-functions/utils/build-not-found-result';
import { buildSkippedResult } from 'src/logic-functions/utils/build-skipped-result';
import { isWithinTtl } from 'src/logic-functions/utils/is-within-ttl';
import { nowIso } from 'src/logic-functions/utils/now-iso';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type EnrichResult } from 'src/types/enrich-result';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { isDefined } from 'src/utils/is-defined';
import { toErrorMessage } from 'src/utils/to-error-message';

export const enrichChunk = async <TNode, TData, TParams>(
  client: CoreApiClient,
  recordIds: string[],
  input: BulkEnrichInput,
  adapter: BatchEnrichmentAdapter<TNode, TData, TParams>,
  resultById: Map<string, EnrichResult>,
): Promise<void> => {
  let nodes: TNode[];
  try {
    nodes = await adapter.readRecords(client, recordIds);
  } catch (error) {
    const message = toErrorMessage(error);
    for (const recordId of recordIds) {
      resultById.set(recordId, buildErrorResult(recordId, message));
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
        buildErrorResult(
          recordId,
          `${adapter.objectNameSingular} ${recordId} not found`,
        ),
      );
      continue;
    }

    if (input.force !== true && isWithinTtl(adapter.getLastEnrichedAt(node))) {
      resultById.set(
        recordId,
        buildSkippedResult(
          recordId,
          'Recently enriched; skipped (use force to re-run).',
        ),
      );
      continue;
    }

    const params = adapter.extractParams(node, input);
    if (!isDefined(params)) {
      resultById.set(
        recordId,
        buildSkippedResult(recordId, adapter.noIdentifierMessage),
      );
      continue;
    }

    toEnrich.push({ recordId, node, params });
  }

  if (toEnrich.length === 0) {
    return;
  }

  let outcomes: PdlEnrichResult<TData>[];
  try {
    outcomes = await adapter.enrichBatch(toEnrich.map((entry) => entry.params));
  } catch (error) {
    const message = toErrorMessage(error);
    for (const entry of toEnrich) {
      resultById.set(entry.recordId, buildErrorResult(entry.recordId, message));
    }
    await adapter
      .updateManyStatus(
        client,
        toEnrich.map((entry) => entry.recordId),
        { pdlEnrichmentStatus: 'ERROR' },
      )
      .catch(() => undefined);

    return;
  }

  const enrichedAt = nowIso();

  const notFoundIds: string[] = [];
  const pdlErrorIds: string[] = [];
  const matched: { recordId: string; data: Record<string, unknown> }[] = [];

  for (let index = 0; index < toEnrich.length; index++) {
    const { recordId, node } = toEnrich[index];
    const outcome = outcomes[index];

    if (!isDefined(outcome) || outcome.outcome === 'error') {
      const message = isDefined(outcome)
        ? outcome.message
        : 'People Data Labs returned no response for this record.';
      resultById.set(recordId, buildErrorResult(recordId, message));
      pdlErrorIds.push(recordId);
      continue;
    }

    if (outcome.outcome === 'not_found') {
      notFoundIds.push(recordId);
      continue;
    }

    try {
      const data = await adapter.buildMatchedData(
        client,
        node,
        outcome,
        enrichedAt,
      );
      matched.push({ recordId, data });
    } catch (error) {
      resultById.set(recordId, buildErrorResult(recordId, toErrorMessage(error)));
    }
  }

  if (pdlErrorIds.length > 0) {
    await adapter
      .updateManyStatus(client, pdlErrorIds, { pdlEnrichmentStatus: 'ERROR' })
      .catch(() => undefined);
  }

  if (notFoundIds.length > 0) {
    try {
      await adapter.updateManyStatus(client, notFoundIds, {
        pdlEnrichmentStatus: 'NOT_FOUND',
        pdlLastEnrichedAt: enrichedAt,
      });
      for (const recordId of notFoundIds) {
        resultById.set(recordId, buildNotFoundResult(recordId));
      }
    } catch (error) {
      const message = toErrorMessage(error);
      for (const recordId of notFoundIds) {
        resultById.set(recordId, buildErrorResult(recordId, message));
      }
    }
  }

  if (matched.length > 0) {
    const settled = await Promise.allSettled(
      matched.map((entry) =>
        adapter.updateOne(client, entry.recordId, entry.data),
      ),
    );

    settled.forEach((outcome, index) => {
      const entry = matched[index];
      if (outcome.status === 'fulfilled') {
        resultById.set(
          entry.recordId,
          buildMatchedResult(entry.recordId, Object.keys(entry.data)),
        );
      } else {
        resultById.set(
          entry.recordId,
          buildErrorResult(entry.recordId, toErrorMessage(outcome.reason)),
        );
      }
    });
  }
};
