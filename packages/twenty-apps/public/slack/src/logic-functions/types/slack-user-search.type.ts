export type SlackUserSearchOption = {
  slackUserId: string;
  slackTeamId: string;
  displayName: string | undefined;
  email: string | undefined;
};

export type SlackUserSearchResult =
  | { success: true; slackUsers: SlackUserSearchOption[] }
  | { success: false; message: string; error?: string };
