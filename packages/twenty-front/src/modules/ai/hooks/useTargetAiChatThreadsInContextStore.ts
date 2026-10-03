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
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

type AiChatThreadToTarget = {
  id: string;
  title?: string | null;
  deletedAt?: string | null;
  lastActivityAt?: string | null;
};

export const useTargetAiChatThreadsInContextStore = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
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
      threads,
    }: {
      contextStoreInstanceId: string;
      threads: AiChatThreadToTarget[];
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
        { mode: 'selection', selectedRecordIds: threads.map(({ id }) => id) },
      );
      store.set(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily(
          instanceKey,
        ),
        threads.length,
      );
      upsertRecordsInStore({
        partialRecords: threads.map((thread) => ({
          __typename: 'AgentChatThread',
          id: thread.id,
          title: thread.title ?? null,
          deletedAt: thread.deletedAt ?? null,
          ...(isDefined(thread.lastActivityAt)
            ? { lastActivityAt: thread.lastActivityAt }
            : {}),
        })),
      });
    },
    [store, upsertRecordsInStore, chatObjectMetadataItem],
  );

  return { targetAiChatThreadsInContextStore };
};
