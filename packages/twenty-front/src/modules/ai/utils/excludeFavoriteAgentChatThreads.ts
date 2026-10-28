import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';

export const excludeFavoriteAgentChatThreads = ({
  threads,
  favoriteThreads,
}: {
  threads: AgentChatThreadListItem[];
  favoriteThreads: Pick<AgentChatThreadListItem, 'id'>[];
}) => {
  const favoriteThreadIds = new Set(favoriteThreads.map(({ id }) => id));

  return threads.filter(({ id }) => !favoriteThreadIds.has(id));
};
