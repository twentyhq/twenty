// Reads of customer content; every mutation is audited regardless.
export const AUDITED_SERVER_ADMIN_QUERIES = new Set<string>([
  'getAdminWorkspaceChatThreads',
  'getAdminChatThreadMessages',
]);
