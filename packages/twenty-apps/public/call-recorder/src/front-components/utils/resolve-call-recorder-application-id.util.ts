import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

const applicationIdPromiseByFrontComponentId = new Map<
  string,
  Promise<string>
>();

const fetchCallRecorderApplicationId = async (frontComponentId: string) => {
  const client = new MetadataApiClient();
  const frontComponentResult = await client.query({
    frontComponent: {
      __args: { id: frontComponentId },
      applicationId: true,
    },
  });
  const applicationId = frontComponentResult.frontComponent?.applicationId;

  if (!isNonEmptyString(applicationId)) {
    throw new Error('Could not resolve the call recorder application.');
  }

  return applicationId;
};

export const resolveCallRecorderApplicationId = (
  frontComponentId: string,
): Promise<string> => {
  const existingApplicationIdPromise =
    applicationIdPromiseByFrontComponentId.get(frontComponentId);

  if (isUndefined(existingApplicationIdPromise)) {
    const applicationIdPromise =
      fetchCallRecorderApplicationId(frontComponentId);

    applicationIdPromiseByFrontComponentId.set(
      frontComponentId,
      applicationIdPromise,
    );

    void applicationIdPromise.catch(() => {
      if (
        applicationIdPromiseByFrontComponentId.get(frontComponentId) ===
        applicationIdPromise
      ) {
        applicationIdPromiseByFrontComponentId.delete(frontComponentId);
      }
    });

    return applicationIdPromise;
  }

  return existingApplicationIdPromise;
};
