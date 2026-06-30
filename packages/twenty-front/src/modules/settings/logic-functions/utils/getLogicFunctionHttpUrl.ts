import { isNonEmptyString } from '@sniptt/guards';

export const getFunctionsBaseUrl = ({
  publicFunctionDomain,
  workspaceSubdomain,
}: {
  publicFunctionDomain?: string | null;
  workspaceSubdomain?: string | null;
}): string | undefined => {
  if (
    isNonEmptyString(publicFunctionDomain) &&
    isNonEmptyString(workspaceSubdomain)
  ) {
    return `https://${workspaceSubdomain}.${publicFunctionDomain}`;
  }

  return undefined;
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
    publicFunctionDomain,
    workspaceSubdomain,
  });

  if (isNonEmptyString(functionsBaseUrl)) {
    return `${functionsBaseUrl}${normalizedPath}`;
  }

  return `${serverBaseUrl}/s${normalizedPath}`;
};
