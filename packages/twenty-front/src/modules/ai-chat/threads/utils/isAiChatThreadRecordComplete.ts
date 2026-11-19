import { isDefined } from 'twenty-shared/utils';

// Live updates and favorites can store a partial thread before it is fetched
export const isAiChatThreadRecordComplete = (
  thread: { conversationType?: unknown } | null | undefined,
): boolean => isDefined(thread?.conversationType);
