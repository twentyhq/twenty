import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TWENTY_FUNCTIONS_URL_ENV_VAR_NAME } from 'src/constants/twenty-functions-url-env-var-name';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const TWENTY_API_URL_ENV_VAR_NAME = 'TWENTY_API_URL';

type ClientConfigResponse = {
  defaultSubdomain?: string | null;
  frontDomain?: string | null;
  isMultiWorkspaceEnabled?: boolean | null;
  publicFunctionDomain?: string | null;
};

type OwnRouteTarget = {
  baseUrl?: string;
  pathPrefix: '' | '/s';
};

const LEGACY_ROUTE_TARGET: OwnRouteTarget = { pathPrefix: '/s' };

const getCurrentWorkspaceSubdomain = async (): Promise<string | undefined> => {
  const { currentWorkspace } = await new MetadataApiClient().query({
    currentWorkspace: { subdomain: true },
  });
  const workspaceSubdomain = currentWorkspace?.subdomain;

  return isNonEmptyString(workspaceSubdomain) ? workspaceSubdomain : undefined;
};

const buildWorkspaceLegacyRouteBaseUrl = ({
  apiUrl,
  defaultSubdomain,
  frontDomain,
  workspaceSubdomain,
}: {
  apiUrl: string | undefined;
  defaultSubdomain: string | null | undefined;
  frontDomain: string | null | undefined;
  workspaceSubdomain: string | undefined;
}): string | undefined => {
  if (
    !isNonEmptyString(apiUrl) ||
    !isNonEmptyString(frontDomain) ||
    !isNonEmptyString(workspaceSubdomain) ||
    workspaceSubdomain === defaultSubdomain
  ) {
    return undefined;
  }

  try {
    const workspaceRouteUrl = new URL(apiUrl);

    workspaceRouteUrl.hostname = `${workspaceSubdomain}.${frontDomain}`;

    return workspaceRouteUrl.origin;
  } catch {
    return undefined;
  }
};

// HTTP route triggers resolve the workspace from the request host before auth.
// In multi-workspace local/dev installs, plain TWENTY_API_URL (localhost) is
// not enough; the legacy /s route must be called through the workspace host.
export const resolveOwnRouteTarget = async (): Promise<OwnRouteTarget> => {
  const injectedFunctionsUrl = process.env[TWENTY_FUNCTIONS_URL_ENV_VAR_NAME];

  if (isNonEmptyString(injectedFunctionsUrl)) {
    return { baseUrl: injectedFunctionsUrl, pathPrefix: '' };
  }

  try {
    const clientConfig = await new RestApiClient().get<ClientConfigResponse>(
      '/client-config',
    );
    const publicFunctionDomain = clientConfig?.publicFunctionDomain;

    if (isNonEmptyString(publicFunctionDomain)) {
      const workspaceSubdomain = await getCurrentWorkspaceSubdomain();

      return isNonEmptyString(workspaceSubdomain)
        ? {
            baseUrl: `https://${workspaceSubdomain}.${publicFunctionDomain}`,
            pathPrefix: '',
          }
        : LEGACY_ROUTE_TARGET;
    }

    if (clientConfig?.isMultiWorkspaceEnabled === true) {
      const workspaceSubdomain = await getCurrentWorkspaceSubdomain();
      const workspaceLegacyRouteBaseUrl = buildWorkspaceLegacyRouteBaseUrl({
        apiUrl: process.env[TWENTY_API_URL_ENV_VAR_NAME],
        defaultSubdomain: clientConfig.defaultSubdomain,
        frontDomain: clientConfig.frontDomain,
        workspaceSubdomain,
      });

      if (isNonEmptyString(workspaceLegacyRouteBaseUrl)) {
        return { baseUrl: workspaceLegacyRouteBaseUrl, pathPrefix: '/s' };
      }
    }

    return LEGACY_ROUTE_TARGET;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        `[call-recorder] own route target resolution failed, falling back to the legacy /s route: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return LEGACY_ROUTE_TARGET;
  }
};
