import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

export const filterInboxRecentThreads = <
  TThread extends Pick<AiChatThreadRecord, 'id' | 'conversationType'>,
>({
  threads,
  favoriteThreads,
  shouldExcludeDirectMessages,
}: {
  threads: TThread[];
  favoriteThreads: Pick<AiChatThreadRecord, 'id'>[];
  shouldExcludeDirectMessages: boolean;
}): TThread[] => {
  const favoriteThreadIds = new Set(favoriteThreads.map(({ id }) => id));

  return threads.filter(
    ({ id, conversationType }) =>
      !favoriteThreadIds.has(id) &&
      !(
        shouldExcludeDirectMessages &&
        conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
      ),
  );
};
