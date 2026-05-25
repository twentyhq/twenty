import { isDefined } from '@utils/is-defined';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { INITIAL_SYNC_MODE_ENV_VAR_NAME } from '@modules/resend/constants/sync-config';

export type InitialSyncModeValue = 'true' | 'false';

const getApplicationId = (): string => {
  const applicationId = process.env.APPLICATION_ID;

  if (typeof applicationId !== 'string' || applicationId.length === 0) {
    throw new Error(
      'APPLICATION_ID is not available in the logic function environment',
    );
  }

  return applicationId;
};

export const setInitialSyncMode = async (
  value: InitialSyncModeValue,
): Promise<void> => {
  const applicationId = getApplicationId();

  const metadataClient = new MetadataApiClient();

  await metadataClient.mutation({
    updateOneApplicationVariable: {
      __args: {
        key: INITIAL_SYNC_MODE_ENV_VAR_NAME,
        value,
        applicationId,
      },
    },
  });
};

export const isInitialSyncModeOn = async (): Promise<boolean> => {
  try {
    const applicationId = getApplicationId();
    const metadataClient = new MetadataApiClient();

    const result = await metadataClient.query({
      findOneApplication: {
        __args: { id: applicationId },
        applicationVariables: {
          key: true,
          value: true,
        },
      },
    });

    const variables = result?.findOneApplication?.applicationVariables;

    if (Array.isArray(variables)) {
      const variable = variables.find(
        (item) => item?.key === INITIAL_SYNC_MODE_ENV_VAR_NAME,
      );

      if (isDefined(variable?.value)) {
        return variable.value === 'true';
      }
    }
  } catch (error) {
    console.warn(
      `[resend] failed to read INITIAL_SYNC_MODE from ApplicationVariable; falling back to env var: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return process.env[INITIAL_SYNC_MODE_ENV_VAR_NAME] === 'true';
};
