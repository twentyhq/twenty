import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadObjectMetadataItemSelector } from '@/ai-chat/threads/states/selectors/aiChatThreadObjectMetadataItemSelector';
import { useRefreshRecordPermissions } from '@/object-record/record-sharing/hooks/useRefreshRecordPermissions';

export const useRefreshAiChatThreadPermissions = () => {
  const store = useStore();
  const { refreshRecordPermissions } = useRefreshRecordPermissions();
  const refreshAiChatThreadPermissions = useCallback(
    async (threadIds: string[]) => {
      const aiChatThreadObjectMetadataItem = store.get(
        aiChatThreadObjectMetadataItemSelector.atom,
      );
      if (!isDefined(aiChatThreadObjectMetadataItem)) {
        return;
      }
      await refreshRecordPermissions(
        threadIds.map((recordId) => ({
          objectMetadataId: aiChatThreadObjectMetadataItem.id,
          recordId,
        })),
      );
    },
    [store, refreshRecordPermissions],
  );
  return { refreshAiChatThreadPermissions };
};
