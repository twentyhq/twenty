import { useStore } from 'jotai';
import { useCallback, useMemo } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshInboxOpenThreadsSummary } from '@/inbox/hooks/useRefreshInboxOpenThreadsSummary';
import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { aiChatThreadStreamedParticipantsState } from '@/ai/states/aiChatThreadStreamedParticipantsState';
import { getAiChatThreadParticipantFromRecord } from '@/ai/utils/getAiChatThreadParticipantFromRecord';
import { mergeAiChatThreadParticipants } from '@/ai/utils/mergeAiChatThreadParticipants';
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
export const AiChatThreadParticipantOperationsEffect = () => {
  const store = useStore();
  const { refreshInboxOpenThreadsSummary } =
    useRefreshInboxOpenThreadsSummary();
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
  const isEnabled =
    isDefined(participantObjectMetadataItem) &&
    isDefined(currentWorkspaceMemberId);

  // Roles that read every record could receive every member's rows, so only
  // the member's own are asked for
  const operationSignature = useMemo(
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
          aiChatThreadStreamedParticipantsState.atom,
          (streamedParticipants) =>
            mergeAiChatThreadParticipants(streamedParticipants, participants),
        );
        store.set(aiChatThreadParticipantsState.atom, (loadedParticipants) =>
          isDefined(loadedParticipants)
            ? mergeAiChatThreadParticipants(loadedParticipants, participants)
            : loadedParticipants,
        );
        refreshInboxOpenThreadsSummary();
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
    [refreshInboxOpenThreadsSummary, store],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    objectMetadataItemId: participantObjectMetadataItem?.id,
    enabled: isEnabled,
  });

  return null;
};
