import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

let applicationIdPromise: Promise<string> | undefined;

const fetchCallRecorderApplicationId = async () => {
  const client = new MetadataApiClient();
  const applicationResult = await client.query({
    findOneApplication: {
      __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      id: true,
    },
  });
  const applicationId = applicationResult.findOneApplication?.id;

  if (!isNonEmptyString(applicationId)) {
    throw new Error('Could not resolve the call recorder application.');
  }

  return applicationId;
};

export const resolveCallRecorderApplicationId = (): Promise<string> => {
  if (isUndefined(applicationIdPromise)) {
    const pendingApplicationIdPromise = fetchCallRecorderApplicationId();

    applicationIdPromise = pendingApplicationIdPromise;

    void pendingApplicationIdPromise.catch(() => {
      if (applicationIdPromise === pendingApplicationIdPromise) {
        applicationIdPromise = undefined;
      }
    });

    return pendingApplicationIdPromise;
  }

  return applicationIdPromise;
};
