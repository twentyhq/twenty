import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { toErrorMessage } from 'src/utils/to-error-message';

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
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

  try {
    const baseUrl = await Promise.race([
      readWorkspaceBaseUrl(),
      new Promise<never>((_, reject) => {
        timeoutTimer = setTimeout(
          () => reject(new Error(`lookup took over ${LOOKUP_TIMEOUT_MS}ms`)),
          LOOKUP_TIMEOUT_MS,
        );
      }),
    ]);

    if (!isNonEmptyString(baseUrl)) {
      console.warn(
        '[teams] workspace URL is missing, record links are disabled',
      );
    }

    return baseUrl;
  } catch (error) {
    console.warn(
      `[teams] failed to read the workspace URL, record links are disabled: ${toErrorMessage(error)}`,
    );

    return undefined;
  } finally {
    clearTimeout(timeoutTimer);
  }
};
