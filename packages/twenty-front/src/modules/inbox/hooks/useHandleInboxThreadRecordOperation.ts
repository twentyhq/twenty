import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { type AiChatThreadUpdate } from '@/ai-chat/threads/types/AiChatThreadUpdate';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useAddInboxThread } from '@/inbox/hooks/useAddInboxThread';
import { useReloadInboxThreads } from '@/inbox/hooks/useReloadInboxThreads';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { getInboxThreadUpdateFromRecordUpdate } from '@/inbox/utils/getInboxThreadUpdateFromRecordUpdate';

export const useHandleInboxThreadRecordOperation = () => {
  const store = useStore();
  const { addInboxThread } = useAddInboxThread();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();
  const { refreshRecentThreads, reloadThreads } = useReloadInboxThreads();

  const handleInboxThreadRecordOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      const applyUpdates = (updates: AiChatThreadUpdate[]) => {
        for (const update of updates) {
          applyAiChatThreadUpdate(update);
        }
      };

      switch (operation.type) {
        case 'create-one': {
          addInboxThread(operation.createdRecord as AiChatThreadRecord);
          return;
        }
        case 'update-one':
        case 'update-many': {
          const updateInputs =
            operation.type === 'update-one'
              ? [operation.result.updateInput]
              : operation.result.updateInputs;

          applyUpdates(updateInputs.map(getInboxThreadUpdateFromRecordUpdate));

          const listedThreadIds =
            store.get(
              inboxThreadListFamilyState.atomFamily(
                getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
              ),
            )?.threadIds ?? [];

          if (
            updateInputs.some(
              ({ recordId }) => !listedThreadIds.includes(recordId),
            )
          ) {
            void refreshRecentThreads();
          }
          return;
        }
        case 'delete-one':
        case 'delete-many': {
          const deletedAt = new Date().toISOString();
          const deletedRecordIds =
            operation.type === 'delete-one'
              ? [operation.deletedRecordId]
              : operation.deletedRecordIds;

          applyUpdates(deletedRecordIds.map((id) => ({ id, deletedAt })));
          return;
        }
        case 'restore-one':
        case 'restore-many': {
          const restoredRecords =
            operation.type === 'restore-one'
              ? [operation.restoredRecord]
              : operation.restoredRecords;

          applyUpdates(
            restoredRecords.map(({ id }) => ({ id, deletedAt: null })),
          );
          return;
        }
        default:
          void reloadThreads();
      }
    },
    [
      addInboxThread,
      applyAiChatThreadUpdate,
      refreshRecentThreads,
      reloadThreads,
      store,
    ],
  );

  return { handleInboxThreadRecordOperation };
};
