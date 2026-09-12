export type SlackResolvedUser = {
  slackUserId: string;
  slackTeamId: string;
  displayName: string | undefined;
  email: string | undefined;
  isInInstalledWorkspace: boolean;
};

export type SlackResolveUserLinkResult =
  | { success: true; slackUser: SlackResolvedUser }
  | { success: false; message: string; error?: string };
