const CLAIM_STATE_COOKIE_PREFIX = 'twenty-app-claim-state';

export const getApplicationRegistrationClaimStateCookieName = (
  applicationRegistrationId: string,
): string => `${CLAIM_STATE_COOKIE_PREFIX}-${applicationRegistrationId}`;

export const getApplicationRegistrationClaimStateSecureCookieName = (
  applicationRegistrationId: string,
): string => `__Host-${CLAIM_STATE_COOKIE_PREFIX}-${applicationRegistrationId}`;
