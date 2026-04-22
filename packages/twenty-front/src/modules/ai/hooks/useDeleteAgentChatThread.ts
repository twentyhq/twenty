import { useMutation } from '@apollo/client/react';
import { useAtomValue, useStore } from 'jotai';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { DeleteChatThreadDocument } from '~/generated-metadata/graphql';

export const useDeleteAgentChatThread = () => {
  const store = useStore();
  const { removeFromDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { switchToNewChat } = useSwitchToNewAiChat();

  const [deleteChatThread, { loading }] = useMutation(DeleteChatThreadDocument);

  const deleteThread = async (threadId: string): Promise<boolean> => {
    let result: Awaited<ReturnType<typeof deleteChatThread>>;
    try {
      result = await deleteChatThread({ variables: { id: threadId } });
    } catch {
      // Apollo rejects on network / GraphQL errors. Honour the boolean
      // contract — callers do `if (await deleteThread(id))`, so swallow
      // here and let the caller treat failure uniformly.
      return false;
    }

    if (!result.data?.deleteChatThread) {
      return false;
    }

    // Remove from the sidebar list synchronously so the UI updates without
    // a refetch round-trip.
    removeFromDraft({ key: 'agentChatThreads', itemIds: [threadId] });
    applyChanges();

    // If the deleted thread was the selected one, switch to a new chat.
    const currentThreadId = store.get(currentAiChatThreadState.atom);
    if (currentThreadId === threadId) {
      switchToNewChat();
    }

    return true;
  };

  return { deleteThread, loading };
};
