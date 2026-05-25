export type DiscordListGuildsResultGuild = {
  id: string;
  name: string;
};

export type DiscordListGuildsResult = {
  success: boolean;
  guilds: DiscordListGuildsResultGuild[];
  count: number;
  error?: string;
};
