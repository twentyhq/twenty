import { useStore } from 'jotai';
import { useCallback } from 'react';
import { ContextStorePageType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { aiChatThreadObjectMetadataItemSelector } from '@/ai-chat/threads/states/selectors/aiChatThreadObjectMetadataItemSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useTargetAiChatThreadsInContextStore = () => {
  const store = useStore();
  const aiChatThreadObjectMetadataItem = useAtomStateValue(
    aiChatThreadObjectMetadataItemSelector,
  );

  const targetAiChatThreadsInContextStore = useCallback(
    ({
      contextStoreInstanceId,
      threadIds,
    }: {
      contextStoreInstanceId: string;
      threadIds: string[];
    }) => {
      if (!isDefined(aiChatThreadObjectMetadataItem)) {
        return;
      }

      const instanceKey = { instanceId: contextStoreInstanceId };

      store.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily(
          instanceKey,
        ),
        aiChatThreadObjectMetadataItem.id,
      );
      store.set(
        contextStoreCurrentPageTypeComponentState.atomFamily(instanceKey),
        ContextStorePageType.Record,
      );
      store.set(
        contextStoreTargetedRecordsRuleComponentState.atomFamily(instanceKey),
        { mode: 'selection', selectedRecordIds: threadIds },
      );
      store.set(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily(
          instanceKey,
        ),
        threadIds.length,
      );
    },
    [store, aiChatThreadObjectMetadataItem],
  );

  return { targetAiChatThreadsInContextStore };
};
