import { isString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useApplyAiChatThreadUpdate } from '@/ai/hooks/useApplyAiChatThreadUpdate';
import { useLeaveRemovedInboxThread } from '@/inbox/hooks/useLeaveRemovedInboxThread';
import { useRefreshInboxOpenThreadsSummary } from '@/inbox/hooks/useRefreshInboxOpenThreadsSummary';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const AI_CHAT_THREADS_OPERATION_SIGNATURE = {
  objectNameSingular: StandardObjectNameSingular.AgentChatThread,
  variables: {},
};

const toThreadUpdate = ({
  recordId,
  updatedFields,
  updatedRecord,
}: ObjectRecordOperationUpdateInput): Partial<AiChatThreadRecord> & {
  id: string;
} => {
  const updatedAt = updatedRecord?.updatedAt;

  return {
    id: recordId,
    ...(isString(updatedAt) ? { updatedAt } : {}),
    ...(Object.assign({}, ...updatedFields) as Partial<AiChatThreadRecord>),
  };
};

export const InboxThreadRecordOperationsEffect = () => {
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const { applyAiChatThreadUpdate, addAiChatThread } =
    useApplyAiChatThreadUpdate();
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const refreshAiChatThreads = useCallback(
    () =>
      loadInboxThreadList({
        source: INBOX_RECENT_THREAD_LIST_SOURCE,
        mode: 'refresh',
      }),
    [loadInboxThreadList],
  );
  const { leaveRemovedInboxThread } = useLeaveRemovedInboxThread();
  const store = useStore();
  const { refreshInboxOpenThreadsSummary } =
    useRefreshInboxOpenThreadsSummary();
  const isEnabled = isDefined(chatObjectMetadataItem);

  // The removal check looks the chat up itself, so it runs even if the reload fails.
  const reloadAiChatThreads = useCallback(async () => {
    refreshInboxOpenThreadsSummary();
    await refreshAiChatThreads();
    await leaveRemovedInboxThread();
  }, [
    leaveRemovedInboxThread,
    refreshInboxOpenThreadsSummary,
    refreshAiChatThreads,
  ]);

  useListenToEventsForQuery({
    queryId: 'agent-chat-thread-record-operations',
    operationSignature: AI_CHAT_THREADS_OPERATION_SIGNATURE,
    skip: !isEnabled,
    onSseReconnected: reloadAiChatThreads,
  });

  const handleRecordOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      // Activity, assignment, questions and deletion all move the counts
      refreshInboxOpenThreadsSummary();

      const applyUpdates = (
        updates: (Partial<AiChatThreadRecord> & { id: string })[],
      ) => {
        for (const update of updates) {
          applyAiChatThreadUpdate(update);
        }
      };

      switch (operation.type) {
        case 'create-one': {
          const createdThread = operation.createdRecord as AiChatThreadRecord;

          addAiChatThread(createdThread);
          return;
        }
        case 'update-one':
        case 'update-many': {
          const updateInputs =
            operation.type === 'update-one'
              ? [operation.result.updateInput]
              : operation.result.updateInputs;

          applyUpdates(updateInputs.map(toThreadUpdate));

          // An updated chat past the loaded pages moves to the top
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
            void refreshAiChatThreads();
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
          // Destroy and bulk create events carry no ids
          void reloadAiChatThreads();
      }
    },
    [
      addAiChatThread,
      applyAiChatThreadUpdate,
      refreshInboxOpenThreadsSummary,
      refreshAiChatThreads,
      reloadAiChatThreads,
      store,
    ],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    objectMetadataItemId: chatObjectMetadataItem?.id,
    enabled: isEnabled,
  });

  return null;
};
