import { type SlackUserLinkConsentDecision } from 'src/logic-functions/constants/slack-user-link-consent-decision.type';

export type SlackUserLinkConsentButtonValue = {
  decision: SlackUserLinkConsentDecision;
  slackTeamId: string;
  slackUserId: string;
  workspaceMemberId: string;
  slackUserLinkId: string;
};
