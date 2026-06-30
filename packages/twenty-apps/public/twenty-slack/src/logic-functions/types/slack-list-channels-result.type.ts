export type SlackListChannelsResultChannel = {
  id: string;
  name: string;
  isPrivate: boolean;
  isArchived: boolean;
  isMember: boolean;
  numMembers: number;
  topic: string;
  purpose: string;
};

export type SlackListChannelsResult = {
  success: boolean;
  channels: SlackListChannelsResultChannel[];
  count: number;
  error?: string;
};
