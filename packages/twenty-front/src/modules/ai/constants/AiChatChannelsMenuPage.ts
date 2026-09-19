export const AI_CHAT_CHANNELS_MENU_PAGE = {
  ROOT: 'root',
  CREATE: 'create',
  BROWSE: 'browse',
} as const;

export type AiChatChannelsMenuPage =
  (typeof AI_CHAT_CHANNELS_MENU_PAGE)[keyof typeof AI_CHAT_CHANNELS_MENU_PAGE];
