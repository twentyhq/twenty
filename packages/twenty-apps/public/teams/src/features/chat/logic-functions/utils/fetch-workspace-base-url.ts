import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { toErrorMessage } from 'src/utils/to-error-message';

// The custom domain is the one members open, so it wins over the subdomain.
export const fetchWorkspaceBaseUrl = async (): Promise<string | undefined> => {
  try {
    const { currentWorkspace } = await new MetadataApiClient().query({
      currentWorkspace: {
        workspaceUrls: { customUrl: true, subdomainUrl: true },
      },
    });

    const baseUrl = [
      currentWorkspace?.workspaceUrls?.customUrl,
      currentWorkspace?.workspaceUrls?.subdomainUrl,
    ].find(isNonEmptyString);

    if (!isNonEmptyString(baseUrl)) {
      console.warn(
        '[teams] workspace URL is missing, record links are disabled',
      );

      return undefined;
    }

    return baseUrl.replace(/\/+$/, '');
  } catch (error) {
    console.warn(
      `[teams] failed to read the workspace URL, record links are disabled: ${toErrorMessage(error)}`,
    );

    return undefined;
  }
};
