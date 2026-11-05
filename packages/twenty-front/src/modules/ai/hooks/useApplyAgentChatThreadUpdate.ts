import { useCallback } from 'react';

import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { getChatThreadRecordTypename } from '@/ai/utils/getChatThreadRecordTypename';
import { objectMetadataItemByUniversalIdentifierFamilySelector } from '@/object-metadata/states/objectMetadataItemByUniversalIdentifierFamilySelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

type AgentChatThreadUpdate = Partial<AgentChatThreadRecord> & {
  id: string;
};

export const useApplyAgentChatThreadUpdate = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  // A list page requested before this update must not overwrite it
  const applyAgentChatThreadUpdate = useCallback(
    (update: AgentChatThreadUpdate) => {
      const chatObjectMetadataItem = store.get(
        objectMetadataItemByUniversalIdentifierFamilySelector.selectorFamily(
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
        ),
      );
      const currentRecord = store.get(
        recordStoreFamilyState.atomFamily(update.id),
      );
      const objectTypename = getChatThreadRecordTypename({
        objectNameSingular: chatObjectMetadataItem?.nameSingular,
        currentRecordTypename: currentRecord?.__typename,
        updateRecordTypename: update.__typename,
      });

      if (isDefined(objectTypename)) {
        upsertRecordsInStore({
          partialRecords: [{ ...update, __typename: objectTypename }],
        });
      }
      store.set(
        agentChatThreadRecordUpdateCountState.atom,
        (updateCount) => updateCount + 1,
      );
    },
    [store, upsertRecordsInStore],
  );

  const addAgentChatThread = useCallback(
    (thread: AgentChatThreadUpdate) => {
      applyAgentChatThreadUpdate(thread);

      const agentChatThreadList = store.get(agentChatThreadListState.atom);

      if (
        agentChatThreadList === null ||
        agentChatThreadList.threadIds.includes(thread.id)
      ) {
        return;
      }

      store.set(agentChatThreadListState.atom, {
        ...agentChatThreadList,
        threadIds: [thread.id, ...agentChatThreadList.threadIds],
      });
    },
    [applyAgentChatThreadUpdate, store],
  );

  return { applyAgentChatThreadUpdate, addAgentChatThread };
};
