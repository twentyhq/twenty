import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components';

import { aiChatThreadIdBeingRenamedComponentState } from '@/ai/states/aiChatThreadIdBeingRenamedComponentState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

export const useAiChatThreadRename = ({
  thread,
  commandMenuInstanceId,
}: {
  thread: {
    id: string;
    title?: string | null;
  };
  commandMenuInstanceId: string;
}) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueToast } = useToast();

  const [aiChatThreadIdBeingRenamed, setAiChatThreadIdBeingRenamed] =
    useAtomComponentState(
      aiChatThreadIdBeingRenamedComponentState,
      commandMenuInstanceId,
    );
  const [draftTitle, setDraftTitle] = useState<string | null>(null);

  const isRenaming = aiChatThreadIdBeingRenamed === thread.id;

  // Rename can end from another chat, so each rename starts from the title
  const [wasRenaming, setWasRenaming] = useState(isRenaming);

  if (wasRenaming !== isRenaming) {
    setWasRenaming(isRenaming);
    setDraftTitle(null);
  }

  // A save that ends late must not close a rename started on another chat
  const stopRenaming = () => {
    setAiChatThreadIdBeingRenamed((currentThreadId) =>
      currentThreadId === thread.id ? null : currentThreadId,
    );
    setDraftTitle(null);
  };

  const cancelRename = stopRenaming;

  const commitRename = async (nextTitle: string) => {
    const trimmed = nextTitle.trim();

    if (trimmed.length === 0 || trimmed === (thread.title ?? '')) {
      stopRenaming();
      return;
    }

    try {
      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.AgentChatThread,
        idToUpdate: thread.id,
        updateOneRecordInput: { title: trimmed },
      });
      stopRenaming();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return {
    isRenaming,
    draftTitle: draftTitle ?? thread.title ?? '',
    setDraftTitle,
    cancelRename,
    commitRename,
  };
};
