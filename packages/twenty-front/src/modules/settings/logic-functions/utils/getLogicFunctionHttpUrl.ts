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

  const url = new URL(serverBaseUrl);

  if (
    isMultiWorkspaceEnabled === true &&
    isNonEmptyString(workspaceSubdomain)
  ) {
    url.hostname = `${workspaceSubdomain}.${url.hostname}`;
  }

  return `${url.origin}/s`;
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
