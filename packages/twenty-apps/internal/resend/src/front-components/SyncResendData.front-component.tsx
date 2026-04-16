import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import {
  defineFrontComponent,
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
} from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

import {
  SYNC_RESEND_DATA_COMMAND_UNIVERSAL_IDENTIFIER,
  SYNC_RESEND_DATA_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  SYNC_RESEND_DATA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const SyncResendDataEffect = () => {
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (hasTriggered) {
      return;
    }

    setHasTriggered(true);

    const run = async () => {
      try {
        await updateProgress(0.1);

        const metadataClient = new MetadataApiClient();

        const logicFunctions = await metadataClient.query({
          findManyLogicFunctions: {
            id: true,
            universalIdentifier: true,
          },
        });

        const syncFunction = logicFunctions.findManyLogicFunctions.find(
          (fn) =>
            fn.universalIdentifier ===
            SYNC_RESEND_DATA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        );

        if (!isDefined(syncFunction)) {
          await enqueueSnackbar({
            message: 'Sync logic function not found',
            variant: 'error',
          });
          await unmountFrontComponent();

          return;
        }

        await updateProgress(0.3);

        let result;

        try {
          result = await metadataClient.mutation({
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
        } catch (error) {
          console.error('Failed to execute sync logic function', error);

          const message =
            error instanceof Error
              ? error.message
              : 'Failed to execute sync logic function';

          await enqueueSnackbar({ message, variant: 'error' });
          await unmountFrontComponent();

          return;
        }

        if (result.executeOneLogicFunction.status !== 'SUCCESS') {
          const executionError = result.executeOneLogicFunction.error;

          console.error(
            'Sync logic function execution failed',
            executionError,
          );

          const rawMessage =
            typeof executionError?.errorMessage === 'string'
              ? executionError.errorMessage
              : 'Sync logic function execution failed';

          const isRateLimit =
            rawMessage.toLowerCase().includes('rate_limit') ||
            rawMessage.toLowerCase().includes('rate limit');

          const errorMessage = isRateLimit
            ? 'Sync failed: Resend API rate limit exceeded. Please try again later.'
            : `Sync failed: ${rawMessage}`;

          await enqueueSnackbar({
            message: errorMessage,
            variant: 'error',
          });
          await unmountFrontComponent();

          return;
        }

        await updateProgress(1);

        await enqueueSnackbar({
          message: 'Resend data sync completed',
          variant: 'success',
        });

        await unmountFrontComponent();
      } catch (error) {
        console.error('Failed to sync Resend data', error);

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to sync Resend data';

        await enqueueSnackbar({ message, variant: 'error' });
        await unmountFrontComponent();
      }
    };

    run();
  }, [hasTriggered]);

  return null;
};

export default defineFrontComponent({
  universalIdentifier: SYNC_RESEND_DATA_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Sync Resend Data',
  description: 'Triggers a manual sync of all Resend data',
  isHeadless: true,
  component: SyncResendDataEffect,
  command: {
    universalIdentifier: SYNC_RESEND_DATA_COMMAND_UNIVERSAL_IDENTIFIER,
    label: 'Sync Resend data',
    icon: 'IconRefresh',
    isPinned: false,
    availabilityType: 'GLOBAL',
  },
});
