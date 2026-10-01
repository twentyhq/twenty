export type SlackChannelSearchOption = {
  slackChannelId: string;
  name: string;
  isPrivate: boolean;
  isMember: boolean;
};

export type SlackChannelSearchResult =
  | { success: true; slackChannels: SlackChannelSearchOption[] }
  | { success: false; message: string; error?: string };
