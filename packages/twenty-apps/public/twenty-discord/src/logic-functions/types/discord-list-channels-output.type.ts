export type DiscordListChannelsResultChannel = {
  id: string;
  name: string;
  type: number;
  parentId: string | null;
  position: number;
};

export type DiscordListChannelsResult = {
  success: boolean;
  channels: DiscordListChannelsResultChannel[];
  count: number;
  error?: string;
};
