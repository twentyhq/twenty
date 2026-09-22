import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const loadFeatureSettingOrThrow = async (
  variableKey: string,
): Promise<string | undefined> => {
  const client = new MetadataApiClient();
  const result = await client.query({
    findOneApplication: {
      __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      applicationVariables: { key: true, value: true },
    },
  });
  const application = result.findOneApplication;

  if (!isDefined(application)) {
    throw new Error('Could not find the Teams application.');
  }

  return application.applicationVariables.find(
    (variable) => variable.key === variableKey,
  )?.value;
};
