import { type AgentChatThread } from '~/generated-metadata/graphql';

export const groupThreadsByDate = (threads: AgentChatThread[]) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return threads.reduce<{
    today: AgentChatThread[];
    yesterday: AgentChatThread[];
    older: AgentChatThread[];
  }>(
    (acc, thread) => {
      const threadDate = new Date(thread.createdAt);
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
