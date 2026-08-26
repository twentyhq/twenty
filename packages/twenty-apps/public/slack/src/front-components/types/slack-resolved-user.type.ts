export type SlackResolvedUser = {
  slackUserId: string;
  slackTeamId: string;
  displayName: string | undefined;
  isInInstalledWorkspace: boolean;
};
