import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

export const filterInboxRecentThreads = ({
  threads,
  favoriteThreads,
  isDirectMessageEnabled,
}: {
  threads: AiChatThreadRecord[];
  favoriteThreads: Pick<AiChatThreadRecord, 'id'>[];
  isDirectMessageEnabled: boolean;
}): AiChatThreadRecord[] => {
  const favoriteThreadIds = new Set(favoriteThreads.map(({ id }) => id));

  return threads.filter(
    ({ id, conversationType }) =>
      !favoriteThreadIds.has(id) &&
      !(
        isDirectMessageEnabled &&
        conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
      ),
  );
};
