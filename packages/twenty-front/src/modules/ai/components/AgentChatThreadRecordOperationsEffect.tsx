import { isString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useLeaveRemovedAiChatThread } from '@/ai/hooks/useLeaveRemovedAiChatThread';
import { useRefreshAgentChatOpenThreadsSummary } from '@/ai/hooks/useRefreshAgentChatOpenThreadsSummary';
import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useLoadAgentChatThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const AGENT_CHAT_THREADS_OPERATION_SIGNATURE = {
  objectNameSingular: StandardObjectNameSingular.AgentChatThread,
  variables: {},
};

const toThreadUpdate = ({
  recordId,
  updatedFields,
  updatedRecord,
}: ObjectRecordOperationUpdateInput): Partial<AgentChatThreadRecord> & {
  id: string;
} => {
  const updatedAt = updatedRecord?.updatedAt;

  return {
    id: recordId,
    ...(isString(updatedAt) ? { updatedAt } : {}),
    ...(Object.assign({}, ...updatedFields) as Partial<AgentChatThreadRecord>),
  };
};

export const AgentChatThreadRecordOperationsEffect = () => {
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const { applyAgentChatThreadUpdate, addAgentChatThread } =
    useApplyAgentChatThreadUpdate();
  const { loadAgentChatThreadList } = useLoadAgentChatThreadList();
  const refreshAgentChatThreads = useCallback(
    () =>
      loadAgentChatThreadList({
        source: AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
        mode: 'refresh',
      }),
    [loadAgentChatThreadList],
  );
  const { leaveRemovedAiChatThread } = useLeaveRemovedAiChatThread();
  const store = useStore();
  const { refreshAgentChatOpenThreadsSummary } =
    useRefreshAgentChatOpenThreadsSummary();
  const isEnabled = isDefined(chatObjectMetadataItem);

  // The removal check looks the chat up itself, so it runs even if the reload fails.
  const reloadAgentChatThreads = useCallback(async () => {
    refreshAgentChatOpenThreadsSummary();
    await refreshAgentChatThreads();
    await leaveRemovedAiChatThread();
  }, [
    leaveRemovedAiChatThread,
    refreshAgentChatOpenThreadsSummary,
    refreshAgentChatThreads,
  ]);

  useListenToEventsForQuery({
    queryId: 'agent-chat-thread-record-operations',
    operationSignature: AGENT_CHAT_THREADS_OPERATION_SIGNATURE,
    skip: !isEnabled,
    onSseReconnected: reloadAgentChatThreads,
  });

  const handleRecordOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      // Activity, assignment, questions and deletion all move the counts
      refreshAgentChatOpenThreadsSummary();

      const applyUpdates = (
        updates: (Partial<AgentChatThreadRecord> & { id: string })[],
      ) => {
        for (const update of updates) {
          applyAgentChatThreadUpdate(update);
        }
      };

      switch (operation.type) {
        case 'create-one': {
          const createdThread =
            operation.createdRecord as AgentChatThreadRecord;

          addAgentChatThread(createdThread);
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
              agentChatThreadListFamilyState.atomFamily(
                getAgentChatThreadListSourceKey(
                  AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
                ),
              ),
            )?.threadIds ?? [];

          if (
            updateInputs.some(
              ({ recordId }) => !listedThreadIds.includes(recordId),
            )
          ) {
            void refreshAgentChatThreads();
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
          void reloadAgentChatThreads();
      }
    },
    [
      addAgentChatThread,
      applyAgentChatThreadUpdate,
      refreshAgentChatOpenThreadsSummary,
      refreshAgentChatThreads,
      reloadAgentChatThreads,
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
