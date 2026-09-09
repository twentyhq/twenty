import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';

export type SlackUserLinkSummary = {
  slackUserId: string;
  name: string | undefined;
  workspaceMemberId: string | undefined;
  consentState: SlackUserLinkConsentState | undefined;
};
