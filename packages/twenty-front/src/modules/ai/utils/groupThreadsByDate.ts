import { type AgentChatThread } from '~/generated-metadata/graphql';

import { type DateGroupKey } from '@/ai/utils/dateGroupKey';

export const groupThreadsByDate = (
  threads: AgentChatThread[],
): Record<DateGroupKey, AgentChatThread[]> => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return threads.reduce<Record<DateGroupKey, AgentChatThread[]>>(
    (acc, thread) => {
      const threadDate = new Date(thread.updatedAt);
      const threadDateString = threadDate.toDateString();

      if (threadDateString === today.toDateString()) {
        acc.today.push(thread);
      } else if (threadDateString === yesterday.toDateString()) {
        acc.yesterday.push(thread);
      } else {
        acc.older.push(thread);
      }

      return acc;
    },
    { today: [], yesterday: [], older: [] },
  );
};
