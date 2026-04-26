export const AI_CHAT_THREAD_ACTIONS_SCOPE_ID = {
  SIDE_PANEL: 'side-panel',
  NAV_DRAWER: 'nav-drawer',
} as const;

export type AiChatThreadActionsScopeId =
  (typeof AI_CHAT_THREAD_ACTIONS_SCOPE_ID)[keyof typeof AI_CHAT_THREAD_ACTIONS_SCOPE_ID];
