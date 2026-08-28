import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';

// A manual link only grants its member once the Slack user has consented, or
// when it was admin-set for a guest / Slack Connect user we cannot DM. A link
// with no state predates the consent field and was authoritative when it was
// written, so it keeps its grant rather than silently losing it on rollout.
export const isConsentedSlackUserLink = (
  consentState: string | undefined,
): boolean =>
  consentState === undefined ||
  consentState === SLACK_USER_LINK_CONSENT_STATE.ACTIVE ||
  consentState === SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET;
