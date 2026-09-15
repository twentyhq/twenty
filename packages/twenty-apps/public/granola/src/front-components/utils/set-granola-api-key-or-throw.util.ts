import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';

export const setGranolaApiKeyOrThrow = async ({
  frontComponentId,
  apiKey,
}: {
  frontComponentId: string;
  apiKey: string;
}): Promise<void> => {
  const client = new MetadataApiClient();
  const result = await client.query({
    frontComponent: {
      __args: { id: frontComponentId },
      applicationId: true,
    },
  });
  const applicationId = result.frontComponent?.applicationId;

  if (!isNonEmptyString(applicationId)) {
    throw new Error('Could not find the Granola application.');
  }

  await client.mutation({
    updateOneApplicationVariable: {
      __args: {
        key: GRANOLA_API_KEY_ENV_VAR_NAME,
        value: apiKey,
        applicationId,
      },
    },
  });
};
