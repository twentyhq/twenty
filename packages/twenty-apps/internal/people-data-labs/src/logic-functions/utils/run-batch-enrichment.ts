import { type CoreApiClient } from 'twenty-client-sdk/core';

import { aggregateBulkEnrichResult } from 'src/logic-functions/utils/aggregate-bulk-enrich-result';
import {
  buildErrorResult,
  ENRICHMENT_FAILED_MESSAGE,
} from 'src/logic-functions/utils/build-error-result';
import { chunk } from 'src/logic-functions/utils/chunk';
import { enrichChunk } from 'src/logic-functions/utils/enrich-chunk';
import { extractRecordIds } from 'src/logic-functions/utils/extract-record-ids';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type BulkEnrichResult } from 'src/types/bulk-enrich-result';
import { type EnrichResult } from 'src/types/enrich-result';

const PDL_BATCH_SIZE = 100;

export const runBatchEnrichment = async <TNode, TData, TParams>(
  client: CoreApiClient,
  input: BulkEnrichInput,
  adapter: BatchEnrichmentAdapter<TNode, TData, TParams>,
): Promise<BulkEnrichResult> => {
  const recordIds = Array.from(new Set(extractRecordIds(input.records)));
  const resultById = new Map<string, EnrichResult>();

  for (const recordIdsChunk of chunk(recordIds, PDL_BATCH_SIZE)) {
    await enrichChunk(client, recordIdsChunk, input, adapter, resultById);
  }

  const results = recordIds.map(
    (recordId) =>
      resultById.get(recordId) ??
      buildErrorResult(recordId, ENRICHMENT_FAILED_MESSAGE),
  );

  return aggregateBulkEnrichResult(results);
};
