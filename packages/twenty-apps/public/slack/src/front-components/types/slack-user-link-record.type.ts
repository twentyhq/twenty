import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

export type SlackUserLinkRecord = {
  id: string;
  name: string | null;
  slackUserId: string | null;
  slackTeamId: string | null;
  source: SlackUserLinkSource | undefined;
  consentState: SlackUserLinkConsentState | undefined;
  workspaceMemberId: string | null;
  workspaceMemberName: string | null;
};
