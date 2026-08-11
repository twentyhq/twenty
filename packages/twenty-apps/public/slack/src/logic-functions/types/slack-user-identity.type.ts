export type SlackUserIdentity = {
  slackUserId: string;
  slackTeamId: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
  // False for bots, Slackbot, deactivated accounts, guests and unconfirmed
  // emails. Says nothing about the team, which is checked separately.
  isRegularUserAccount: boolean;
};
