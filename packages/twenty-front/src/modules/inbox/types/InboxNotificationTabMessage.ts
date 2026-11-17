export type InboxNotificationTabMessage =
  | { type: 'focused-tab-request'; requestId: string }
  | { type: 'focused-tab-response'; requestId: string };
