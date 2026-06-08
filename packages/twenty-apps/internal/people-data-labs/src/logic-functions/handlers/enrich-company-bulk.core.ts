import { CoreApiClient } from 'twenty-client-sdk/core';

import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company.core';
import { runBulkEnrichment } from 'src/logic-functions/utils/run-bulk-enrichment';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input.type';
import { type BulkEnrichResult } from 'src/types/bulk-enrich-result.type';

export const enrichCompanyBulkCore = ({
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
