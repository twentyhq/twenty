import { CoreApiClient } from 'twenty-client-sdk/core';

import { enrichPersonCore } from 'src/logic-functions/handlers/enrich-person';
import { runBulkEnrichment } from 'src/logic-functions/utils/run-bulk-enrichment';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type BulkEnrichResult } from 'src/types/bulk-enrich-result';

export const enrichPersonBulkCore = ({
  input,
  client = new CoreApiClient(),
}: {
  input: BulkEnrichInput;
  client?: CoreApiClient;
}): Promise<BulkEnrichResult> =>
  runBulkEnrichment({
    input,
    enrichRecord: (recordId) =>
      enrichPersonCore(
        { recordId, force: input.force, minLikelihood: input.minLikelihood },
        client,
      ),
  });
