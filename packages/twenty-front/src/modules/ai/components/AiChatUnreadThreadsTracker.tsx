import { AiChatUnreadThreadsEffect } from '@/ai/components/AiChatUnreadThreadsEffect';
import { useChatThreads } from '@/ai/hooks/useChatThreads';

// Every thread the reader can see, not the ones one page happens to list: the
// drawer counts unread threads across channels it is not showing, and a
// narrower list would silently unread-mark whatever it left out.
export const AiChatUnreadThreadsTracker = () => {
  const { threads } = useChatThreads();

  // The query is keyed on the thread ids, and a message arriving in a thread
  // that is already listed leaves them identical, so Apollo has nothing to
  // refetch on. Keying the query on the last activity as well asks again
  // whenever a conversation moves, which is what puts a badge back on a thread
  // somebody has already read.
  const threadActivityKey = threads
    .map((thread) => `${thread.id}:${thread.lastMessageAt ?? thread.updatedAt}`)
    .join(',');

  return (
    <AiChatUnreadThreadsEffect
      key={threadActivityKey}
      threadIds={threads.map((thread) => thread.id)}
    />
  );
};
