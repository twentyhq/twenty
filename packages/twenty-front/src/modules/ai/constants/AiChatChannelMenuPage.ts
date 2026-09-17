export const AI_CHAT_CHANNEL_MENU_PAGE = {
  ROOT: 'root',
  MEMBERS: 'members',
  RENAME: 'rename',
} as const;

export type AiChatChannelMenuPage =
  (typeof AI_CHAT_CHANNEL_MENU_PAGE)[keyof typeof AI_CHAT_CHANNEL_MENU_PAGE];
