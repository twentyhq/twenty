import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';

import { agentChatUnreadThreadIdsState } from '@/ai/states/agentChatUnreadThreadIdsState';
import { MarkChatThreadReadDocument } from '~/generated-metadata/graphql';

export const useMarkAiChatThreadRead = () => {
  const [markReadMutation] = useMutation(MarkChatThreadReadDocument);
  const store = useStore();

  // The row is dropped from the unread set before the round trip: a thread
  // stops looking unread the moment it is open, and a failed call leaves the
  // server cursor where it was, so the next list refresh puts it back.
  const markAiChatThreadRead = async (threadId: string) => {
    store.set(agentChatUnreadThreadIdsState.atom, (unreadThreadIds) =>
      unreadThreadIds.filter((unreadThreadId) => unreadThreadId !== threadId),
    );

    await markReadMutation({ variables: { threadId } });
  };

  return { markAiChatThreadRead };
};
