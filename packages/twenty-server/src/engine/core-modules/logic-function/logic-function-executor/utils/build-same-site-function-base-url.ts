import { isNonEmptyString } from '@sniptt/guards';

export const buildSameSiteFunctionBaseUrl = ({
  serverUrl,
  subdomain,
  isMultiWorkspaceEnabled,
}: {
  serverUrl: string;
  subdomain: string;
  isMultiWorkspaceEnabled: boolean;
}): string => {
  const url = new URL(serverUrl);

  if (isMultiWorkspaceEnabled && isNonEmptyString(subdomain)) {
    url.hostname = `${subdomain}.${url.hostname}`;
  }

  return `${url.origin}/s`;
};
