import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  buildErrorResult,
  ENRICHMENT_FAILED_MESSAGE,
} from 'src/logic-functions/utils/build-error-result';
import { runBatchEnrichment } from 'src/logic-functions/utils/run-batch-enrichment';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type EnrichResult } from 'src/types/enrich-result';
import { type SingleEnrichInput } from 'src/types/single-enrich-input';

const NO_RECORD_ID_MESSAGE = 'No record id was provided to enrich.';

export const runSingleEnrichment = async <TNode, TData, TParams>({
  client,
  input,
  adapter,
}: {
  client: CoreApiClient;
  input: SingleEnrichInput;
  adapter: BatchEnrichmentAdapter<TNode, TData, TParams>;
}): Promise<EnrichResult> => {
  const recordId = input.recordId?.trim();

  if (!isNonEmptyString(recordId)) {
    return buildErrorResult({ recordId: '', error: NO_RECORD_ID_MESSAGE });
  }

  const bulkResult = await runBatchEnrichment({
    client,
    input: {
      records: recordId,
      overrideExistingValues: input.overrideExistingValues,
      minLikelihood: input.minLikelihood,
    },
    adapter,
  });

  return (
    bulkResult.results[0] ??
    buildErrorResult({ recordId, error: ENRICHMENT_FAILED_MESSAGE })
  );
};
