import { useEffect } from 'react';

import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { useTargetAiChatThreadsInContextStore } from '@/ai/hooks/useTargetAiChatThreadsInContextStore';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const AiChatInboxSelectionToContextStoreEffect = () => {
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const { targetAiChatThreadsInContextStore } =
    useTargetAiChatThreadsInContextStore();

  useEffect(() => {
    targetAiChatThreadsInContextStore({
      contextStoreInstanceId: AI_CHAT_INBOX_INSTANCE_ID,
      threadIds: selectedRecordIds,
    });

    return () => {
      targetAiChatThreadsInContextStore({
        contextStoreInstanceId: AI_CHAT_INBOX_INSTANCE_ID,
        threadIds: [],
      });
    };
  }, [selectedRecordIds, targetAiChatThreadsInContextStore]);

  return null;
};
