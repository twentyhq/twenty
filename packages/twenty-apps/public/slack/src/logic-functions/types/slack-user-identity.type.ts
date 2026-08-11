export type SlackUserIdentity = {
  slackUserId: string;
  slackTeamId: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
  // False for bots, Slackbot, deactivated accounts, Slack guests and
  // unconfirmed emails. Says nothing about which Slack workspace the account
  // belongs to: a Slack Connect user from another team is still a regular
  // account. The team is checked separately, against the live connection at
  // link time.
  isRegularUserAccount: boolean;
};
