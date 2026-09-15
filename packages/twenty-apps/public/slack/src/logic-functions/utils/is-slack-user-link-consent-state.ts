import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';

export const isSlackUserLinkConsentState = (
  value: unknown,
): value is SlackUserLinkConsentState =>
  Object.values(SLACK_USER_LINK_CONSENT_STATE).some((state) => state === value);
