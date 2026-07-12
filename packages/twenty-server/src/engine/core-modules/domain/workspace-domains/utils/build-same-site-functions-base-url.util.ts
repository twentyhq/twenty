import { isNonEmptyString } from '@sniptt/guards';

export const buildSameSiteFunctionsBaseUrl = ({
  serverUrl,
  isMultiWorkspaceEnabled,
  workspaceSubdomain,
}: {
  serverUrl: string;
  isMultiWorkspaceEnabled: boolean;
  workspaceSubdomain: string;
}): string => {
  const sameSiteFunctionsBaseUrl = new URL(serverUrl);

  sameSiteFunctionsBaseUrl.pathname = `${sameSiteFunctionsBaseUrl.pathname.replace(
    /\/+$/,
    '',
  )}/s`;

  if (isMultiWorkspaceEnabled && isNonEmptyString(workspaceSubdomain)) {
    sameSiteFunctionsBaseUrl.hostname = `${workspaceSubdomain}.${sameSiteFunctionsBaseUrl.hostname}`;
  }

  return `${sameSiteFunctionsBaseUrl.origin}${sameSiteFunctionsBaseUrl.pathname}`;
};
