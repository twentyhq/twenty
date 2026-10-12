import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useTargetAiChatThreadsInContextStore = () => {
  const store = useStore();
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );

  const targetAiChatThreadsInContextStore = useCallback(
    ({
      contextStoreInstanceId,
      threadIds,
    }: {
      contextStoreInstanceId: string;
      threadIds: string[];
    }) => {
      if (!isDefined(chatObjectMetadataItem)) {
        return;
      }

      const instanceKey = { instanceId: contextStoreInstanceId };

      store.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily(
          instanceKey,
        ),
        chatObjectMetadataItem.id,
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
    [store, chatObjectMetadataItem],
  );

  return { targetAiChatThreadsInContextStore };
};
