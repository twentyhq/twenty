import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

const stripTrailingSlashes = (url: string): string => url.replace(/\/+$/, '');

// a workspace on a custom domain still serves its subdomain host, and links get
// copied from either, so both have to match; the first is the canonical one
export const fetchWorkspaceBaseUrls = async (): Promise<string[]> => {
  try {
    const { currentWorkspace } = await new MetadataApiClient().query({
      currentWorkspace: {
        workspaceUrls: { customUrl: true, subdomainUrl: true },
      },
    });

    const baseUrls = [
      currentWorkspace?.workspaceUrls?.customUrl,
      currentWorkspace?.workspaceUrls?.subdomainUrl,
    ]
      .filter(isNonEmptyString)
      .map(stripTrailingSlashes);

    if (baseUrls.length === 0) {
      console.warn(
        '[slack] workspace URL is missing, record links are disabled',
      );
    }

    return baseUrls;
  } catch (error) {
    console.warn(
      `[slack] failed to read the workspace URL, record links are disabled: ${error instanceof Error ? error.message : String(error)}`,
    );

    return [];
  }
};
