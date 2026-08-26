import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';

// A manual link only grants its member once the Slack user has consented, or
// when it was admin-set for a guest / Slack Connect user we cannot DM.
export const isConsentedSlackUserLink = (
  consentState: string | undefined,
): boolean =>
  consentState === SLACK_USER_LINK_CONSENT_STATE.ACTIVE ||
  consentState === SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET;
