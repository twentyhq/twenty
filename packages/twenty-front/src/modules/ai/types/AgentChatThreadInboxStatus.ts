export type AgentChatThreadInboxStatus = {
  scope: 'INBOX' | 'SNOOZED' | 'ARCHIVED';
  isUnread: boolean;
  isSubscribed: boolean;
  isMentioned: boolean;
  isAssignedToMe: boolean;
  // The latest inbox change the member made, shown on the row and in the chat
  event: {
    type: 'SNOOZED' | 'SNOOZE_ENDED' | 'DONE' | 'UNSUBSCRIBED';
    at: string;
  } | null;
};
