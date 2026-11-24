import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';

import { SYNC_MEMBER_RECORDING_PREFERENCE_ROUTE_PATH } from 'src/constants/sync-member-recording-preference-route-path';

export const requestMemberRecordingPreferenceSync = async (): Promise<void> => {
  try {
    await new RestApiClient().post(
      `/s${SYNC_MEMBER_RECORDING_PREFERENCE_ROUTE_PATH}`,
      {},
    );
  } catch {
    await enqueueSnackbar({
      message: t(
        'Choice saved, but your upcoming meetings could not be updated yet.',
      ),
      variant: 'error',
    });
  }
};
