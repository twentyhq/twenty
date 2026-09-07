import { type SlackUserLinkConsentDecision } from 'src/logic-functions/types/slack-user-link-consent-decision.type';

export type SlackUserLinkConsentButtonValue = {
  decision: SlackUserLinkConsentDecision;
  slackTeamId: string;
  slackUserId: string;
  workspaceMemberId: string;
  slackUserLinkId: string;
};
