import { type sendInboxMessage } from 'twenty-sdk/logic-function';

export type InboxMessage = Omit<
  Parameters<typeof sendInboxMessage>[0],
  'workspaceMemberIds'
>;
