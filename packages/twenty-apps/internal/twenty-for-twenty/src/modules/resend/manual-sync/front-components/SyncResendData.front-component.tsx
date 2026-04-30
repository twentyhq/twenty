import { isDefined } from '@utils/is-defined';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  Command,
  enqueueSnackbar,
  navigate,
} from 'twenty-sdk/front-component';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from '@constants/universal-identifiers';
import { INITIAL_SYNC_MODE_ENV_VAR_NAME } from '@modules/resend/constants/sync-config';
import {
  SYNC_RESEND_DATA_COMMAND_UNIVERSAL_IDENTIFIER,
  SYNC_RESEND_DATA_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { resolveSyncStatusPageLayoutId } from '@modules/resend/manual-sync/utils/resolve-sync-status-page-layout-id';
import { resetAllSyncCursors } from '@modules/resend/sync/cursor/utils/reset-all-sync-cursors';

const resolveApplicationId = async (
  metadataClient: MetadataApiClient,
): Promise<string> => {
  const { findManyApplications } = await metadataClient.query({
    findManyApplications: {
      id: true,
      universalIdentifier: true,
    },
  });

  const match = findManyApplications.find(
    (application: { universalIdentifier: string }) =>
      application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
  );

  if (!isDefined(match)) {
    throw new Error('Twenty-for-Twenty application not found');
  }

  return match.id;
};

const flipInitialSyncModeOn = async (
  metadataClient: MetadataApiClient,
  applicationId: string,
): Promise<void> => {
  await metadataClient.mutation({
    updateOneApplicationVariable: {
      __args: {
        key: INITIAL_SYNC_MODE_ENV_VAR_NAME,
        value: 'true',
        applicationId,
      },
    },
  });
};

const execute = async () => {
  const metadataClient = new MetadataApiClient();
  const coreApiClient = new CoreApiClient();

  await resetAllSyncCursors(coreApiClient);

  const applicationId = await resolveApplicationId(metadataClient);

  await flipInitialSyncModeOn(metadataClient, applicationId);

  const pageLayoutId = await resolveSyncStatusPageLayoutId(
    metadataClient,
    applicationId,
  );

  await enqueueSnackbar({
    message:
      'Sync cursors reset and initial sync triggered — it will run in the background.',
    variant: 'success',
  });

  await navigate(AppPath.PageLayoutPage, { pageLayoutId });
};

const SyncResendData = () => <Command execute={execute} />;

export default defineFrontComponent({
  universalIdentifier: SYNC_RESEND_DATA_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Sync Resend Data',
  description:
    'Resets every Resend sync cursor and flips the application into initial sync mode so the scheduled sync handlers restart from scratch on their next run.',
  isHeadless: true,
  component: SyncResendData,
  command: {
    universalIdentifier: SYNC_RESEND_DATA_COMMAND_UNIVERSAL_IDENTIFIER,
    label: 'Sync Resend data',
    icon: 'IconRefresh',
    isPinned: false,
    availabilityType: 'GLOBAL',
  },
});
