import { isDefined } from 'twenty-shared/utils';

export const buildAuthorizationHeadersFromAccessToken = (
  applicationAccessToken?: string,
): Record<string, string> | undefined =>
  isDefined(applicationAccessToken)
    ? { Authorization: `Bearer ${applicationAccessToken}` }
    : undefined;
