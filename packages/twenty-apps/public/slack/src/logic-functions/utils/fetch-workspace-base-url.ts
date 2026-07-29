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

    return isNonEmptyString(subdomainUrl)
      ? stripTrailingSlashes(subdomainUrl)
      : undefined;
  } catch {
    return undefined;
  }
};
