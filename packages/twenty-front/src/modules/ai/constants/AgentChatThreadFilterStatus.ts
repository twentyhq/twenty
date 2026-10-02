export const AGENT_CHAT_THREAD_FILTER_STATUS = {
  ACTIVE: 'active',
  UNREAD: 'unread',
  SNOOZED: 'snoozed',
  DONE: 'done',
  // Deleting a chat used to archive it, so saved filters still hold 'archived'
  DELETED: 'archived',
  ALL: 'all',
} as const;
