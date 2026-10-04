import { useStore } from 'jotai';
import { useCallback, useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { getAgentChatThreadParticipantFromRecord } from '@/ai/utils/getAgentChatThreadParticipantFromRecord';
import { mergeAgentChatThreadParticipants } from '@/ai/utils/mergeAgentChatThreadParticipants';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// The member's inbox state follows what they do in their other tabs and
// devices, and snoozes the server ends
export const AgentChatThreadParticipantOperationsEffect = () => {
  const store = useStore();
  const participantObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.AgentChatThreadParticipant,
      objectNameType: 'singular',
    },
  );
  const currentWorkspaceMemberId = useAtomStateValue(
    currentWorkspaceMemberState,
  )?.id;
  const isEnabled =
    isDefined(participantObjectMetadataItem) &&
    isDefined(currentWorkspaceMemberId);

  // Roles that read every record could receive every member's rows, so only
  // the member's own are asked for
  const operationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.AgentChatThreadParticipant,
      variables: {
        filter: { workspaceMemberId: { eq: currentWorkspaceMemberId } },
      },
    }),
    [currentWorkspaceMemberId],
  );

  useListenToEventsForQuery({
    queryId: 'agent-chat-thread-participant-operations',
    operationSignature,
    skip: !isEnabled,
  });

  const handleRecordOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      // Also kept aside, for when the member's rows have not loaded yet
      const applyParticipants = (
        participants: AgentChatThreadParticipantFieldsFragment[],
      ) => {
        store.set(
          agentChatThreadStreamedParticipantsState.atom,
          (streamedParticipants) =>
            mergeAgentChatThreadParticipants(
              streamedParticipants,
              participants,
            ),
        );
        store.set(agentChatThreadParticipantsState.atom, (loadedParticipants) =>
          isDefined(loadedParticipants)
            ? mergeAgentChatThreadParticipants(loadedParticipants, participants)
            : loadedParticipants,
        );
      };

      switch (operation.type) {
        case 'create-one': {
          applyParticipants([
            getAgentChatThreadParticipantFromRecord(operation.createdRecord),
          ]);
          return;
        }
        case 'update-one':
        case 'update-many': {
          const updateInputs =
            operation.type === 'update-one'
              ? [operation.result.updateInput]
              : operation.result.updateInputs;
          const participantsById = new Map(
            [
              ...Object.values(
                store.get(agentChatThreadStreamedParticipantsState.atom),
              ),
              ...Object.values(
                store.get(agentChatThreadParticipantsState.atom) ?? {},
              ),
            ].map((participant) => [participant.id, participant]),
          );
          const updatedParticipants = updateInputs.map(
            ({ recordId, updatedFields }) => {
              const participant = participantsById.get(recordId);

              return isDefined(participant)
                ? { ...participant, ...Object.assign({}, ...updatedFields) }
                : undefined;
            },
          );

          // Updates only carry what changed, so a row not loaded yet comes
          // whole with its thread, and a page on its way is read again in
          // case it holds an older copy
          if (!updatedParticipants.every(isDefined)) {
            store.set(
              agentChatThreadRecordUpdateCountState.atom,
              (updateCount) => updateCount + 1,
            );
          }

          applyParticipants(updatedParticipants.filter(isDefined));
          return;
        }
      }
    },
    [store],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    objectMetadataItemId: participantObjectMetadataItem?.id,
    enabled: isEnabled,
  });

  return null;
};
