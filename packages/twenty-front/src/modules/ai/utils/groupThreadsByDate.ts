import { AgentChatThread } from '~/generated-metadata/graphql';

export const groupThreadsByDate = (threads: AgentChatThread[]) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayThreads = threads.filter((thread) => {
    const threadDate = new Date(thread.createdAt);
    return threadDate.toDateString() === today.toDateString();
  });

  const yesterdayThreads = threads.filter((thread) => {
    const threadDate = new Date(thread.createdAt);
    return threadDate.toDateString() === yesterday.toDateString();
  });

  const olderThreads = threads.filter((thread) => {
    const threadDate = new Date(thread.createdAt);
    return (
      threadDate.toDateString() !== today.toDateString() &&
      threadDate.toDateString() !== yesterday.toDateString()
    );
  });

  return {
    today: todayThreads,
    yesterday: yesterdayThreads,
    older: olderThreads,
  };
};
