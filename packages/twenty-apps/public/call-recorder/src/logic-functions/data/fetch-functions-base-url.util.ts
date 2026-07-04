import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TWENTY_FUNCTIONS_URL_ENV_VAR_NAME } from 'src/constants/twenty-functions-url-env-var-name';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type ClientConfigResponse = {
  publicFunctionDomain?: string | null;
};

// The legacy /s route returns 410 for logic functions created after the
// deployment's route cutoff whenever an isolated public function origin
// exists, so route calls must target that origin. Returns undefined when the
// deployment has no public function domain (self-hosting), where /s stays
// served.
export const fetchFunctionsBaseUrl = async (): Promise<string | undefined> => {
  const injectedFunctionsUrl = process.env[TWENTY_FUNCTIONS_URL_ENV_VAR_NAME];

  if (isNonEmptyString(injectedFunctionsUrl)) {
    return injectedFunctionsUrl;
  }

  try {
    const clientConfig = await new RestApiClient().get<ClientConfigResponse>(
      '/client-config',
    );
    const publicFunctionDomain = clientConfig?.publicFunctionDomain;

    if (!isNonEmptyString(publicFunctionDomain)) {
      return undefined;
    }

    const { currentWorkspace } = await new MetadataApiClient().query({
      currentWorkspace: { subdomain: true },
    });
    const workspaceSubdomain = currentWorkspace?.subdomain;

    if (!isNonEmptyString(workspaceSubdomain)) {
      return undefined;
    }

    return `https://${workspaceSubdomain}.${publicFunctionDomain}`;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        `[call-recorder] functions base url resolution failed, falling back to the legacy /s route: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return undefined;
  }
};
