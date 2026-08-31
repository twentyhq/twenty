export type SlackUserLinkRecord = {
  id: string;
  name: string | null;
  slackUserId: string | null;
  slackTeamId: string | null;
  source: string | null;
  consentState: string | null;
  workspaceMemberId: string | null;
  workspaceMemberName: string | null;
};
