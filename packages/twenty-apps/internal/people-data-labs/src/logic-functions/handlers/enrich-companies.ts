import { CoreApiClient } from 'twenty-client-sdk/core';

import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company';
import { runBulkEnrichment } from 'src/logic-functions/utils/run-bulk-enrichment';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type BulkEnrichResult } from 'src/types/bulk-enrich-result';

export const enrichCompaniesCore = ({
  input,
  client = new CoreApiClient(),
}: {
  input: BulkEnrichInput;
  client?: CoreApiClient;
}): Promise<BulkEnrichResult> =>
  runBulkEnrichment({
    input,
    enrichRecord: (recordId) =>
      enrichCompanyCore({ recordId, force: input.force }, client),
  });
