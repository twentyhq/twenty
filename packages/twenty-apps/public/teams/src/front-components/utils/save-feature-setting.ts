import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type SaveFeatureSettingParams = {
  variableKey: string;
  isEnabled: boolean;
};

export const saveFeatureSetting = async ({
  variableKey,
  isEnabled,
}: SaveFeatureSettingParams): Promise<void> => {
  const client = new MetadataApiClient();
  const result = await client.query({
    findOneApplication: {
      __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      id: true,
    },
  });
  const applicationId = result.findOneApplication?.id;

  if (!isNonEmptyString(applicationId)) {
    throw new Error('Could not find the Teams application.');
  }

  const response = await client.mutation({
    updateOneApplicationVariable: {
      __args: {
        applicationId,
        key: variableKey,
        value: String(isEnabled),
      },
    },
  });

  if (!response.updateOneApplicationVariable) {
    throw new Error('Could not save the Teams setting.');
  }
};
