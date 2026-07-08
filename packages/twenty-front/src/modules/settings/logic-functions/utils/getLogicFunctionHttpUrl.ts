import { isNonEmptyString } from '@sniptt/guards';

export const getFunctionsBaseUrl = ({
  serverBaseUrl,
  publicFunctionDomain,
  workspaceSubdomain,
}: {
  serverBaseUrl: string;
  publicFunctionDomain?: string | null;
  workspaceSubdomain?: string | null;
}): string => {
  if (
    isNonEmptyString(publicFunctionDomain) &&
    isNonEmptyString(workspaceSubdomain)
  ) {
    return `https://${workspaceSubdomain}.${publicFunctionDomain}`;
  }

  return `${serverBaseUrl}/s`;
};

export const getLogicFunctionHttpUrl = ({
  path,
  serverBaseUrl,
  publicFunctionDomain,
  workspaceSubdomain,
}: {
  path: string;
  serverBaseUrl: string;
  publicFunctionDomain?: string | null;
  workspaceSubdomain?: string | null;
}): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const functionsBaseUrl = getFunctionsBaseUrl({
    serverBaseUrl,
    publicFunctionDomain,
    workspaceSubdomain,
  });

  return `${functionsBaseUrl}${normalizedPath}`;
};
