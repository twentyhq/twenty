import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, enqueueSnackbar, updateProgress } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';

import {
  SYNC_RESEND_DATA_COMMAND_UNIVERSAL_IDENTIFIER,
  SYNC_RESEND_DATA_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  SYNC_RESEND_DATA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';

const execute = async () => {
  await updateProgress(0.1);

  const metadataClient = new MetadataApiClient();

  const { findManyLogicFunctions } = await metadataClient.query({
    findManyLogicFunctions: {
      id: true,
      universalIdentifier: true,
    },
  });

  const syncFunction = findManyLogicFunctions.find(
    (fn) =>
      fn.universalIdentifier ===
      SYNC_RESEND_DATA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  );

  if (!isDefined(syncFunction)) {
    throw new Error('Sync logic function not found');
  }

  await updateProgress(0.3);

  const { executeOneLogicFunction } = await metadataClient.mutation({
    executeOneLogicFunction: {
      __args: {
        input: {
          id: syncFunction.id,
          payload: {} as Record<string, never>,
        },
      },
      status: true,
      error: true,
    },
  });

  if (executeOneLogicFunction.status !== 'SUCCESS') {
    const rawMessage =
      typeof executeOneLogicFunction.error?.errorMessage === 'string'
        ? executeOneLogicFunction.error.errorMessage
        : 'Sync logic function execution failed';

    const isRateLimit =
      rawMessage.toLowerCase().includes('rate_limit') ||
      rawMessage.toLowerCase().includes('rate limit');

    throw new Error(
      isRateLimit
        ? 'Sync failed: Resend API rate limit exceeded. Please try again later.'
        : `Sync failed: ${rawMessage}`,
    );
  }

  await updateProgress(1);

  await enqueueSnackbar({
    message: 'Resend data sync completed',
    variant: 'success',
  });
};

const SyncResendData = () => <Command execute={execute} />;

export default defineFrontComponent({
  universalIdentifier: SYNC_RESEND_DATA_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Sync Resend Data',
  description: 'Triggers a manual sync of all Resend data',
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
