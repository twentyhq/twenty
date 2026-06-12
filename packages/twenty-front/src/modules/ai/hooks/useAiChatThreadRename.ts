import { useState } from 'react';

import { useRenameChatThread } from '@/ai/hooks/useRenameChatThread';
import { type AgentChatThread } from '~/generated-metadata/graphql';

export const useAiChatThreadRename = (thread: AgentChatThread) => {
  const { renameChatThread } = useRenameChatThread();

  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(thread.title ?? '');

  const startRename = () => {
    setDraftTitle(thread.title ?? '');
    setIsRenaming(true);
  };

  const cancelRename = () => {
    setIsRenaming(false);
    setDraftTitle(thread.title ?? '');
  };

  const commitRename = async (nextTitle: string) => {
    const trimmed = nextTitle.trim();

    if (trimmed.length === 0 || trimmed === (thread.title ?? '')) {
      setIsRenaming(false);
      return;
    }

    const succeeded = await renameChatThread(thread.id, trimmed);

    if (succeeded) {
      setIsRenaming(false);
    }
  };

  return {
    isRenaming,
    draftTitle,
    setDraftTitle,
    startRename,
    cancelRename,
    commitRename,
  };
};
