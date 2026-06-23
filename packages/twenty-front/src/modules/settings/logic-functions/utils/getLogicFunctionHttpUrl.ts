import { isNonEmptyString } from '@sniptt/guards';

// Isolated, cookieless base on which a workspace's HTTP logic functions are
// served on Twenty Cloud (e.g. https://acme.withtwenty.com). Undefined when no
// public function domain is configured (self-hosting).
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

// Builds the public URL of an HTTP-triggered logic function. When a public
// function domain is configured (Twenty Cloud), the function is served from the
// isolated origin at https://{workspaceSubdomain}.{publicFunctionDomain}{path}.
// Otherwise (self-hosting) it falls back to the legacy {serverBaseUrl}/s{path}.
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
