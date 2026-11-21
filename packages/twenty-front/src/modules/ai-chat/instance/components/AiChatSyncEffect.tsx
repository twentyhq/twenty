import { useStore } from 'jotai';
import { useCallback, useMemo } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { getAiChatThreadParticipantFromRecord } from '@/ai-chat/threads/utils/getAiChatThreadParticipantFromRecord';
import { mergeAiChatThreadParticipants } from '@/ai-chat/threads/utils/mergeAiChatThreadParticipants';
import { TOOL_INDEX_DEPENDENT_METADATA_NAMES } from '@/ai-chat/tool-calls/constants/ToolIndexDependentMetadataNames';
import { TOOL_INDEX_INVALIDATION_DEBOUNCE_TIME_IN_MS } from '@/ai-chat/tool-calls/constants/ToolIndexInvalidationDebounceTimeInMs';
import { useInvalidateToolIndex } from '@/ai/hooks/useInvalidateToolIndex';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const AiChatSyncEffect = () => {
  const store = useStore();
  const participantObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThreadParticipant,
      objectNameType: 'singular',
    },
  );
  const currentWorkspaceMemberId = useAtomStateValue(
    currentWorkspaceMemberState,
  )?.id;
  const isParticipantSyncEnabled =
    isDefined(participantObjectMetadataItem) &&
    isDefined(currentWorkspaceMemberId);
  const { invalidateToolIndex } = useInvalidateToolIndex();

  // Roles that read every record could receive every member's rows, so only the member's own are asked for
  const participantOperationSignature = useMemo(
    () => ({
      objectNameSingular: StandardObjectNameSingular.AgentChatThreadParticipant,
      variables: {
        filter: { workspaceMemberId: { eq: currentWorkspaceMemberId } },
      },
    }),
    [currentWorkspaceMemberId],
  );

  useListenToEventsForQuery({
    queryId: 'agent-chat-thread-participant-operations',
    operationSignature: participantOperationSignature,
    skip: !isParticipantSyncEnabled,
  });

  const handleParticipantOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      const applyParticipants = (
        participants: AgentChatThreadParticipantFieldsFragment[],
      ) => {
        store.set(
          aiChatThreadParticipantsState.atom,
          (currentParticipants) => ({
            ...currentParticipants,
            rowsByThreadId: mergeAiChatThreadParticipants(
              currentParticipants.rowsByThreadId,
              participants,
            ),
          }),
        );
      };

      switch (operation.type) {
        case 'create-one': {
          applyParticipants([
            getAiChatThreadParticipantFromRecord(operation.createdRecord),
          ]);
          return;
        }
        case 'update-one':
        case 'update-many': {
          const updateInputs =
            operation.type === 'update-one'
              ? [operation.result.updateInput]
              : operation.result.updateInputs;

          applyParticipants(
            updateInputs
              .map(({ updatedRecord }) => updatedRecord)
              .filter(isDefined)
              .map(getAiChatThreadParticipantFromRecord),
          );
          return;
        }
      }
    },
    [store],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleParticipantOperation,
    objectMetadataItemId: participantObjectMetadataItem?.id,
    enabled: isParticipantSyncEnabled,
  });

  // Installing an app broadcasts many entities at once; one rebuild is enough
  const debouncedInvalidateToolIndex = useDebouncedCallback(
    invalidateToolIndex,
    TOOL_INDEX_INVALIDATION_DEBOUNCE_TIME_IN_MS,
    { leading: false },
  );

  const handleMetadataOperation = useCallback(
    ({
      metadataName,
    }: MetadataOperationBrowserEventDetail<Record<string, unknown>>) => {
      if (TOOL_INDEX_DEPENDENT_METADATA_NAMES.includes(metadataName)) {
        debouncedInvalidateToolIndex();
      }
    },
    [debouncedInvalidateToolIndex],
  );

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: handleMetadataOperation,
  });

  // Changes broadcast while disconnected are not replayed
  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: debouncedInvalidateToolIndex,
  });

  return null;
};
