import { useStore } from 'jotai';
import { useCallback } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useLeaveRemovedAiChatThread } from '@/ai/hooks/useLeaveRemovedAiChatThread';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const AGENT_CHAT_THREADS_OPERATION_SIGNATURE = {
  objectNameSingular: CoreObjectNameSingular.AgentChatThread,
  variables: {},
};

const toThreadUpdate = ({
  recordId,
  updatedFields,
}: ObjectRecordOperationUpdateInput): Partial<AgentChatThreadRecord> & {
  id: string;
} => ({
  id: recordId,
  ...(Object.assign({}, ...updatedFields) as Partial<AgentChatThreadRecord>),
});

export const AgentChatThreadRecordOperationsEffect = () => {
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const { applyAgentChatThreadUpdate, addAgentChatThread } =
    useApplyAgentChatThreadUpdate();
  const { refreshAgentChatThreads } = useRefreshAgentChatThreads();
  const { leaveRemovedAiChatThread } = useLeaveRemovedAiChatThread();
  const store = useStore();
  const isEnabled = isDefined(chatObjectMetadataItem);

  // The removal check looks the chat up itself, so it runs even if the reload fails.
  const reloadAgentChatThreads = useCallback(async () => {
    await refreshAgentChatThreads();
    await leaveRemovedAiChatThread();
  }, [leaveRemovedAiChatThread, refreshAgentChatThreads]);

  useListenToEventsForQuery({
    queryId: 'agent-chat-thread-record-operations',
    operationSignature: AGENT_CHAT_THREADS_OPERATION_SIGNATURE,
    skip: !isEnabled,
    onSseReconnected: reloadAgentChatThreads,
  });

  const handleRecordOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
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

          // Workflow run conversations are listed with the run, not in the chat list.
          if (!isDefined(createdThread.workflowRunId)) {
            addAgentChatThread(createdThread);
          }
          return;
        }
        case 'update-one':
        case 'update-many': {
          const updateInputs =
            operation.type === 'update-one'
              ? [operation.result.updateInput]
              : operation.result.updateInputs;

          applyUpdates(updateInputs.map(toThreadUpdate));

          // An updated chat past the loaded pages moves to the top; reloading keeps workflow run chats out.
          const listedThreadIds =
            store.get(agentChatThreadListState.atom)?.threadIds ?? [];

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
