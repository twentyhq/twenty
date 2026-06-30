import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

export const execute = async ({path, recordIds}:{ path: string; recordIds: string[] }) => {
  try {
    const client = new RestApiClient();


    await client.post(`/s${path}`, { recordIds });

    await enqueueSnackbar({
      message: `Enriched ${recordIds.length > 1 ? 'records.' : 'record.'}`,
      variant: 'success',
    });
  } catch {
    await enqueueSnackbar({
      message: 'Records enrichment failed',
      variant: 'error',
    });
  }
};
