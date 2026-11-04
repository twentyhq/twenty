import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';

export const excludeFavoriteAgentChatThreads = <
  TThread extends Pick<AgentChatThreadListItem, 'id'>,
>({
  threads,
  favoriteThreads,
}: {
  threads: TThread[];
  favoriteThreads: Pick<AgentChatThreadListItem, 'id'>[];
}): TThread[] => {
  const favoriteThreadIds = new Set(favoriteThreads.map(({ id }) => id));

  return threads.filter(({ id }) => !favoriteThreadIds.has(id));
};
