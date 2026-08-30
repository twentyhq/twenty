import { type SLACK_USER_LINK_CONSENT_DECISION } from 'src/logic-functions/constants/slack-user-link-consent-decision';

export type SlackUserLinkConsentDecision =
  (typeof SLACK_USER_LINK_CONSENT_DECISION)[keyof typeof SLACK_USER_LINK_CONSENT_DECISION];
