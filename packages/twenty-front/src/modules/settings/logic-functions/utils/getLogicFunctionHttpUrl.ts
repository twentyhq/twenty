import { isNonEmptyString } from '@sniptt/guards';

export const getFunctionsBaseUrl = ({
  serverBaseUrl,
  publicFunctionDomain,
  workspaceSubdomain,
  isMultiWorkspaceEnabled,
}: {
  serverBaseUrl: string;
  publicFunctionDomain?: string | null;
  workspaceSubdomain?: string | null;
  isMultiWorkspaceEnabled?: boolean;
}): string => {
  if (
    isNonEmptyString(publicFunctionDomain) &&
    isNonEmptyString(workspaceSubdomain)
  ) {
    return `https://${workspaceSubdomain}.${publicFunctionDomain}`;
  }

  // The base argument resolves a relative REACT_APP_SERVER_BASE_URL override
  // against the page origin instead of throwing during render.
  const sameSiteFunctionsBaseUrl = new URL(
    serverBaseUrl,
    window.location.origin,
  );

  if (
    isMultiWorkspaceEnabled === true &&
    isNonEmptyString(workspaceSubdomain)
  ) {
    sameSiteFunctionsBaseUrl.hostname = `${workspaceSubdomain}.${sameSiteFunctionsBaseUrl.hostname}`;
  }

  sameSiteFunctionsBaseUrl.pathname = `${sameSiteFunctionsBaseUrl.pathname.replace(/\/+$/, '')}/s`;

  // origin + pathname drops any query or fragment from the server base URL,
  // which would otherwise corrupt trigger paths appended to this base URL.
  return `${sameSiteFunctionsBaseUrl.origin}${sameSiteFunctionsBaseUrl.pathname}`;
};

export const getLogicFunctionHttpUrl = ({
  path,
  serverBaseUrl,
  publicFunctionDomain,
  workspaceSubdomain,
  isMultiWorkspaceEnabled,
}: {
  path: string;
  serverBaseUrl: string;
  publicFunctionDomain?: string | null;
  workspaceSubdomain?: string | null;
  isMultiWorkspaceEnabled?: boolean;
}): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const functionsBaseUrl = getFunctionsBaseUrl({
    serverBaseUrl,
    publicFunctionDomain,
    workspaceSubdomain,
    isMultiWorkspaceEnabled,
  });

  return `${functionsBaseUrl}${normalizedPath}`;
};
