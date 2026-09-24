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
import { type CompanyIdByMatchKeyCache } from 'src/types/company-id-by-match-key-cache';
import { type EnrichResult } from 'src/types/enrich-result';
import { isDefined } from 'src/utils/is-defined';

const PDL_BATCH_SIZE = 100;

export const runBatchEnrichment = async <TNode, TData, TParams>({
  client,
  input,
  adapter,
}: {
  client: CoreApiClient;
  input: BulkEnrichInput;
  adapter: BatchEnrichmentAdapter<TNode, TData, TParams>;
}): Promise<BulkEnrichResult> => {
  const minLikelihoods = adapter.resolveMinLikelihoods({ input });
  const recordIds = Array.from(new Set(extractRecordIds(input.records)));
  const resultById = new Map<string, EnrichResult>();
  const companyIdByMatchKeyCache: CompanyIdByMatchKeyCache = new Map();
  let pdlAccessErrorMessage: string | undefined;

  for (const recordIdsChunk of chunk({ items: recordIds, size: PDL_BATCH_SIZE })) {
    const enrichChunkResult = await enrichChunk({
      client,
      recordIds: recordIdsChunk,
      input,
      minLikelihoods,
      adapter,
      resultById,
      companyIdByMatchKeyCache,
    });

    pdlAccessErrorMessage = enrichChunkResult.pdlAccessErrorMessage;

    if (isDefined(pdlAccessErrorMessage)) {
      break;
    }
  }

  const results = recordIds.map(
    (recordId) =>
      resultById.get(recordId) ??
      buildErrorResult({
        recordId,
        error: pdlAccessErrorMessage ?? ENRICHMENT_FAILED_MESSAGE,
      }),
  );

  return aggregateBulkEnrichResult(results);
};
