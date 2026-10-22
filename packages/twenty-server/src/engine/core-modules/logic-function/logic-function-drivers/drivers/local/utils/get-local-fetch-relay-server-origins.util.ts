import {
  DEFAULT_API_URL_NAME,
  DEFAULT_FUNCTIONS_URL_NAME,
} from 'twenty-shared/application-runtime';
import { isNonEmptyString } from 'twenty-shared/utils';

// The executor sets these after application variables, so a handler cannot point them elsewhere.
export const getLocalFetchRelayServerOrigins = (
  environmentVariables: Record<string, string>,
): Set<string> => {
  const origins = new Set<string>();

  for (const name of [DEFAULT_API_URL_NAME, DEFAULT_FUNCTIONS_URL_NAME]) {
    const url = environmentVariables[name];

    if (!isNonEmptyString(url) || !URL.canParse(url)) {
      continue;
    }

    origins.add(new URL(url).origin);
  }

  return origins;
};
