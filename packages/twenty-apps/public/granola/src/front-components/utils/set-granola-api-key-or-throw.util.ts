import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';

export const setGranolaApiKeyOrThrow = async ({
  apiKey,
}: {
  apiKey: string;
}): Promise<void> => {
  const client = new MetadataApiClient();
  const result = await client.query({
    findOneApplication: {
      __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      id: true,
    },
  });
  const applicationId = result.findOneApplication?.id;

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
