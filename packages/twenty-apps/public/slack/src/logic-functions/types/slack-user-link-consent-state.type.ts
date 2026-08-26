import { type SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';

export type SlackUserLinkConsentState =
  (typeof SLACK_USER_LINK_CONSENT_STATE)[keyof typeof SLACK_USER_LINK_CONSENT_STATE];
