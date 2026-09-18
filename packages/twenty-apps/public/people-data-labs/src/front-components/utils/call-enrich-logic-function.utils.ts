import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { buildEnrichmentSnackbarParams } from 'src/front-components/utils/build-enrichment-snackbar-params';
import { type BulkEnrichResult } from 'src/types/bulk-enrich-result';

export const execute = async ({
  path,
  recordIds,
}: {
  path: string;
  recordIds: string[];
}) => {
  try {
    const client = new RestApiClient();

    const bulkEnrichResult = await client.post<BulkEnrichResult>(`/s${path}`, {
      recordIds,
    });

    await enqueueSnackbar(buildEnrichmentSnackbarParams(bulkEnrichResult));
  } catch {
    await enqueueSnackbar({
      message: 'Records enrichment failed',
      variant: 'error',
    });
  }
};
