import { useCallback } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useLeaveRemovedAiChatThread } from '@/ai/hooks/useLeaveRemovedAiChatThread';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const THREAD_LIST_FIELD_NAMES = ['title', 'deletedAt', 'updatedAt'] as const;

const AGENT_CHAT_THREADS_OPERATION_SIGNATURE = {
  objectNameSingular: CoreObjectNameSingular.AgentChatThread,
  variables: {},
};

const toThreadListUpdate = ({
  recordId,
  updatedFields,
}: ObjectRecordOperationUpdateInput) => {
  const updatedValues = Object.assign({}, ...updatedFields) as Record<
    string,
    unknown
  >;
  const listValues = Object.fromEntries(
    THREAD_LIST_FIELD_NAMES.filter(
      (fieldName) => fieldName in updatedValues,
    ).map((fieldName) => [fieldName, updatedValues[fieldName]]),
  ) as Partial<FlatAgentChatThread>;

  return Object.keys(listValues).length > 0
    ? { id: recordId, ...listValues }
    : undefined;
};

// Chats are renamed, deleted, restored and destroyed through the record API,
// while the chat keeps its own list of conversations
export const AgentChatThreadRecordOperationsEffect = () => {
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { refreshAgentChatThreads } = useRefreshAgentChatThreads();
  const { leaveRemovedAiChatThread } = useLeaveRemovedAiChatThread();
  const isEnabled = isDefined(chatObjectMetadataItem);

  useListenToEventsForQuery({
    queryId: 'agent-chat-thread-record-operations',
    operationSignature: AGENT_CHAT_THREADS_OPERATION_SIGNATURE,
    skip: !isEnabled,
  });

  const handleRecordOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      const applyUpdates = (
        updates: (Partial<FlatAgentChatThread> & {
          id: string;
        })[],
      ) => {
        for (const update of updates) {
          applyAgentChatThreadUpdate(update);
        }
      };

      switch (operation.type) {
        case 'update-one':
        case 'update-many': {
          const updateInputs =
            operation.type === 'update-one'
              ? [operation.result.updateInput]
              : operation.result.updateInputs;

          applyUpdates(updateInputs.map(toThreadListUpdate).filter(isDefined));
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
          void refreshAgentChatThreads().then((threads) => {
            if (isDefined(threads)) {
              leaveRemovedAiChatThread();
            }
          });
      }
    },
    [
      applyAgentChatThreadUpdate,
      leaveRemovedAiChatThread,
      refreshAgentChatThreads,
    ],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    objectMetadataItemId: chatObjectMetadataItem?.id,
    enabled: isEnabled,
  });

  return null;
};
