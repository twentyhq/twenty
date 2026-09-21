import { isNonEmptyString } from '@sniptt/guards';

export const buildAuthorizationHeadersFromAccessToken = (
  applicationAccessToken?: string,
): Record<string, string> | undefined =>
  isNonEmptyString(applicationAccessToken)
    ? { Authorization: `Bearer ${applicationAccessToken}` }
    : undefined;
