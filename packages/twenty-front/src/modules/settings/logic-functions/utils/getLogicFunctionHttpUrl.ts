import { isNonEmptyString } from '@sniptt/guards';

// Builds the public URL of an HTTP-triggered logic function. When a public
// function domain is configured (Twenty Cloud), the function is served from an
// isolated, cookieless origin at https://{workspaceSubdomain}.{publicFunctionDomain}{path}.
// Otherwise (self-hosting) it falls back to the legacy {serverBaseUrl}/s{path} route.
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

  if (
    isNonEmptyString(publicFunctionDomain) &&
    isNonEmptyString(workspaceSubdomain)
  ) {
    return `https://${workspaceSubdomain}.${publicFunctionDomain}${normalizedPath}`;
  }

  return `${serverBaseUrl}/s${normalizedPath}`;
};
