import { MetadataApiClient, MetadataSchema } from 'twenty-client-sdk/metadata';

import { fetchWithTimeout } from 'src/logic-functions/utils/fetch-with-timeout.util';

// Deferred bot deletion exists for per-user app preferences, so it rolls out under their flag.
export const isAppPreferencesEnabled = async (): Promise<boolean> => {
  try {
    const metadataClient = new MetadataApiClient({
      runAs: 'application',
      fetch: fetchWithTimeout,
    });

    const queryResult = await metadataClient.query({
      currentWorkspace: { featureFlags: { key: true, value: true } },
    });

    return (queryResult.currentWorkspace?.featureFlags ?? []).some(
      (featureFlag) =>
        featureFlag.key ===
          MetadataSchema.enumFeatureFlagKey.IS_APP_PREFERENCES_ENABLED &&
        featureFlag.value,
    );
  } catch (error) {
    console.warn(
      `[call-recorder] failed to read the app preferences feature flag, treating it as off: ${error instanceof Error ? error.message : String(error)}`,
    );

    return false;
  }
};
