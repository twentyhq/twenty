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
  baseUrl: string;
  pathPrefix: '' | '/s';
};

const OWN_ROUTE_TARGET_RESOLUTION_ERROR_MESSAGE =
  'Unable to resolve Call Recorder own route target without TWENTY_FUNCTIONS_URL';

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

// Prefer the server-injected route origin. Until it is available in released
// servers, resolve this app's own HTTP route from client config.
export const resolveOwnRouteTarget = async (): Promise<OwnRouteTarget> => {
  const injectedFunctionsUrl = process.env[TWENTY_FUNCTIONS_URL_ENV_VAR_NAME];

  if (isNonEmptyString(injectedFunctionsUrl)) {
    return { baseUrl: injectedFunctionsUrl, pathPrefix: '' };
  }

  // TODO: Remove this app-side resolution after the server release that
  // injects TWENTY_FUNCTIONS_URL is the minimum supported version.
  try {
    const clientConfig = await new RestApiClient().get<ClientConfigResponse>(
      '/client-config',
    );
    const publicFunctionDomain = clientConfig?.publicFunctionDomain;

    if (isNonEmptyString(publicFunctionDomain)) {
      const workspaceSubdomain = await getCurrentWorkspaceSubdomain();

      if (!isNonEmptyString(workspaceSubdomain)) {
        throw new Error(OWN_ROUTE_TARGET_RESOLUTION_ERROR_MESSAGE);
      }

      return {
        baseUrl: `https://${workspaceSubdomain}.${publicFunctionDomain}`,
        pathPrefix: '',
      };
    }

    if (clientConfig?.isMultiWorkspaceEnabled === false) {
      const apiUrl = process.env[TWENTY_API_URL_ENV_VAR_NAME];

      if (isNonEmptyString(apiUrl)) {
        return { baseUrl: apiUrl, pathPrefix: '/s' };
      }
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
        // Local multi-workspace installs still serve HTTP routes under /s, but
        // the host must include the workspace subdomain.
        return { baseUrl: workspaceLegacyRouteBaseUrl, pathPrefix: '/s' };
      }
    }

    throw new Error(OWN_ROUTE_TARGET_RESOLUTION_ERROR_MESSAGE);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        `[call-recorder] own route target resolution failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    throw error;
  }
};
