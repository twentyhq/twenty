import { isString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useApplyInboxThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useLeaveRemovedInboxThread } from '@/ai/hooks/useLeaveRemovedAiChatThread';
import { useRefreshInboxOpenThreadsSummary } from '@/ai/hooks/useRefreshAgentChatOpenThreadsSummary';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useLoadInboxThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { inboxThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const INBOX_THREADS_OPERATION_SIGNATURE = {
  objectNameSingular: StandardObjectNameSingular.AgentChatThread,
  variables: {},
};

const toThreadUpdate = ({
  recordId,
  updatedFields,
  updatedRecord,
}: ObjectRecordOperationUpdateInput): Partial<InboxThreadRecord> & {
  id: string;
} => {
  const updatedAt = updatedRecord?.updatedAt;

  return {
    id: recordId,
    ...(isString(updatedAt) ? { updatedAt } : {}),
    ...(Object.assign({}, ...updatedFields) as Partial<InboxThreadRecord>),
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
  const { applyInboxThreadUpdate, addInboxThread } =
    useApplyInboxThreadUpdate();
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const refreshInboxThreads = useCallback(
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
  const reloadInboxThreads = useCallback(async () => {
    refreshInboxOpenThreadsSummary();
    await refreshInboxThreads();
    await leaveRemovedInboxThread();
  }, [
    leaveRemovedInboxThread,
    refreshInboxOpenThreadsSummary,
    refreshInboxThreads,
  ]);

  useListenToEventsForQuery({
    queryId: 'agent-chat-thread-record-operations',
    operationSignature: INBOX_THREADS_OPERATION_SIGNATURE,
    skip: !isEnabled,
    onSseReconnected: reloadInboxThreads,
  });

  const handleRecordOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      // Activity, assignment, questions and deletion all move the counts
      refreshInboxOpenThreadsSummary();

      const applyUpdates = (
        updates: (Partial<InboxThreadRecord> & { id: string })[],
      ) => {
        for (const update of updates) {
          applyInboxThreadUpdate(update);
        }
      };

      switch (operation.type) {
        case 'create-one': {
          const createdThread = operation.createdRecord as InboxThreadRecord;

          addInboxThread(createdThread);
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
            void refreshInboxThreads();
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
          void reloadInboxThreads();
      }
    },
    [
      addInboxThread,
      applyInboxThreadUpdate,
      refreshInboxOpenThreadsSummary,
      refreshInboxThreads,
      reloadInboxThreads,
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
