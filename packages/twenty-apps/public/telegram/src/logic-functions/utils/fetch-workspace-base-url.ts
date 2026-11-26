import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { raceAgainstTimeoutOrThrow } from 'src/logic-functions/utils/race-against-timeout-or-throw';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message';

const LOOKUP_TIMEOUT_MS = 5000;

const readWorkspaceBaseUrl = async (): Promise<string | undefined> => {
  const { currentWorkspace } = await new MetadataApiClient().query({
    currentWorkspace: {
      workspaceUrls: { customUrl: true, subdomainUrl: true },
    },
  });

  return [
    currentWorkspace?.workspaceUrls?.customUrl,
    currentWorkspace?.workspaceUrls?.subdomainUrl,
  ]
    .find(isNonEmptyString)
    ?.replace(/\/+$/, '');
};

export const fetchWorkspaceBaseUrl = async (): Promise<string | undefined> => {
  try {
    const baseUrl = await raceAgainstTimeoutOrThrow({
      promise: readWorkspaceBaseUrl(),
      timeoutMs: LOOKUP_TIMEOUT_MS,
      timeoutError: new Error(`lookup took over ${LOOKUP_TIMEOUT_MS}ms`),
    });

    if (!isNonEmptyString(baseUrl)) {
      console.warn(
        '[telegram] workspace URL is missing, record links are disabled',
      );
    }

    return baseUrl;
  } catch (error) {
    console.warn(
      `[telegram] failed to read the workspace URL, record links are disabled: ${toErrorMessage(error)}`,
    );

    return undefined;
  }
};
