import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { fetchWithTimeout } from 'src/logic-functions/utils/fetch-with-timeout.util';

const APP_PREFERENCES_FEATURE_FLAG_KEY = 'IS_APP_PREFERENCES_ENABLED';

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
        featureFlag.key === APP_PREFERENCES_FEATURE_FLAG_KEY &&
        featureFlag.value,
    );
  } catch (error) {
    console.warn(
      `[call-recorder] failed to read the app preferences feature flag, treating it as off: ${error instanceof Error ? error.message : String(error)}`,
    );

    return false;
  }
};
