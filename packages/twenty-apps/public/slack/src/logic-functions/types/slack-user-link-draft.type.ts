import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

export type SlackUserLinkDraft = {
  slackTeamId: string;
  slackUserId: string;
  workspaceMemberId: string;
  name: string;
  source: SlackUserLinkSource;
  consentState: SlackUserLinkConsentState;
};
