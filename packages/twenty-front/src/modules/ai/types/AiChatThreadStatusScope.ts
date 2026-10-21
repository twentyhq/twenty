export type AiChatThreadStatusScope =
  | { type: 'personal' }
  | { type: 'channel'; channelId: string; channelName: string };
