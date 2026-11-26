import { useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useInboxObjectNames } from '@/ai-chat/hooks/useInboxObjectNames';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

export const useAiChatThreadRename = (thread: {
  id: string;
  title?: string | null;
}) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueToast } = useToast();
  const inboxObjectNames = useInboxObjectNames();

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

    try {
      await updateOneRecord({
        objectNameSingular: inboxObjectNames.agentChatThread,
        idToUpdate: thread.id,
        updateOneRecordInput: { title: trimmed },
      });
      setIsRenaming(false);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
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
