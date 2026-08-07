import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

const stripTrailingSlashes = (url: string): string => url.replace(/\/+$/, '');

export const fetchWorkspaceBaseUrl = async (): Promise<string | undefined> => {
  try {
    const { currentWorkspace } = await new MetadataApiClient().query({
      currentWorkspace: {
        workspaceUrls: { customUrl: true, subdomainUrl: true },
      },
    });

    const customUrl = currentWorkspace?.workspaceUrls?.customUrl;
    const subdomainUrl = currentWorkspace?.workspaceUrls?.subdomainUrl;

    if (isNonEmptyString(customUrl)) {
      return stripTrailingSlashes(customUrl);
    }

    if (isNonEmptyString(subdomainUrl)) {
      return stripTrailingSlashes(subdomainUrl);
    }

    console.warn('[slack] workspace URL is missing, record links are disabled');

    return undefined;
  } catch (error) {
    console.warn(
      `[slack] failed to read the workspace URL, record links are disabled: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
