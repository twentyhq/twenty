export const AI_CHAT_THREAD_ITEM_MENU_PAGE = {
  ROOT: 'root',
  MOVE_TO_CHANNEL: 'move-to-channel',
} as const;

export type AiChatThreadItemMenuPage =
  (typeof AI_CHAT_THREAD_ITEM_MENU_PAGE)[keyof typeof AI_CHAT_THREAD_ITEM_MENU_PAGE];
