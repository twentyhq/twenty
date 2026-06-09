import { CoreApiClient } from 'twenty-client-sdk/core';

import { companyEnrichmentAdapter } from 'src/logic-functions/handlers/company-enrichment-adapter';
import { runBatchEnrichment } from 'src/logic-functions/utils/run-batch-enrichment';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type BulkEnrichResult } from 'src/types/bulk-enrich-result';

export const enrichCompaniesCore = ({
  input,
  client = new CoreApiClient(),
}: {
  input: BulkEnrichInput;
  client?: CoreApiClient;
}): Promise<BulkEnrichResult> =>
  runBatchEnrichment(client, input, companyEnrichmentAdapter);
