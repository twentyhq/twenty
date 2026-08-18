export type SlackUserIdentity = {
  slackUserId: string;
  slackTeamId: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
  isRegularUserAccount: boolean;
};
