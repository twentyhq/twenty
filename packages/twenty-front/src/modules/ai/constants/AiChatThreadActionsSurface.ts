export const AI_CHAT_THREAD_ACTIONS_SURFACE = {
  SIDE_PANEL: 'side-panel',
  NAV_DRAWER: 'nav-drawer',
} as const;

export type AiChatThreadActionsSurface =
  (typeof AI_CHAT_THREAD_ACTIONS_SURFACE)[keyof typeof AI_CHAT_THREAD_ACTIONS_SURFACE];
