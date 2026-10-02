export const AGENT_CHAT_THREAD_FILTER_STATUS = {
  ACTIVE: 'active',
  UNREAD: 'unread',
  SNOOZED: 'snoozed',
  DONE: 'done',
  // Stored before chats went to the trash, when deleting one archived it
  DELETED: 'archived',
  ALL: 'all',
} as const;
