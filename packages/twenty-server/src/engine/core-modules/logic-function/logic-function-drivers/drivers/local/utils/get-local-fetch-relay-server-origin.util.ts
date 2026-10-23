import { DEFAULT_API_URL_NAME } from 'twenty-shared/application-runtime';
import { isNonEmptyString } from 'twenty-shared/utils';

// Only the API URL comes from SERVER_URL; the functions URL can be an application's custom domain, which tenants control.
export const getLocalFetchRelayServerOrigin = (
  environmentVariables: Record<string, string>,
): string | undefined => {
  const apiUrl = environmentVariables[DEFAULT_API_URL_NAME];

  if (!isNonEmptyString(apiUrl) || !URL.canParse(apiUrl)) {
    return undefined;
  }

  return new URL(apiUrl).origin;
};
