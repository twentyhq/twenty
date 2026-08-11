export type SlackUserIdentity = {
  slackUserId: string;
  slackTeamId: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
  // False for bots, deactivated accounts and Slack guests. Says nothing about
  // which Slack workspace they belong to: that is checked against the live
  // connection at link time, not from anything cached here.
  isRegularMemberOfOwnTeam: boolean;
};
