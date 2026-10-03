import { useStore } from 'jotai';
import { useEffect } from 'react';

import { AI_CHAT_INBOX_RECORD_SELECTION_INSTANCE_ID } from '@/ai/constants/AiChatInboxRecordSelectionInstanceId';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';

type AiChatInboxRecordIdsEffectProps = {
  threads: Pick<AgentChatThreadRecord, 'id'>[];
};

// Record selection reads the records of a list where a record index keeps
// them, so the inbox keeps its chats there in the order they are shown
export const AiChatInboxRecordIdsEffect = ({
  threads,
}: AiChatInboxRecordIdsEffectProps) => {
  const store = useStore();

  useEffect(() => {
    const instanceId = AI_CHAT_INBOX_RECORD_SELECTION_INSTANCE_ID;
    const recordIdsAtom =
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      });
    const threadIds = threads.map(({ id }) => id);

    // A chat that leaves the list, once done, snoozed or filtered out, leaves
    // the selection too, so it is not selected again when it comes back
    for (const previousThreadId of store.get(recordIdsAtom)) {
      if (!threadIds.includes(previousThreadId)) {
        store.set(
          isRecordSelectedComponentFamilyState.atomFamily({
            instanceId,
            familyKey: previousThreadId,
          }),
          false,
        );
      }
    }

    store.set(recordIdsAtom, threadIds);
  }, [store, threads]);

  return null;
};
