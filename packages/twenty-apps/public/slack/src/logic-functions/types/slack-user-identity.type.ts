export type SlackUserIdentity = {
  slackUserId: string;
  slackTeamId: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
  // False for bots, deactivated accounts, Slack guests and Slack Connect users
  // from another Slack workspace. Their profile email is vouched for by someone
  // other than this workspace admin, so it must never bind a workspace member
  // on its own.
  canBeMatchedOnEmail: boolean;
};
