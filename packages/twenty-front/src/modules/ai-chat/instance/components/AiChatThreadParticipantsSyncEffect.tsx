import { useStore } from 'jotai';
import { useCallback, useMemo } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { getAiChatThreadParticipantFromRecord } from '@/ai-chat/threads/utils/getAiChatThreadParticipantFromRecord';
import { mergeAiChatThreadParticipants } from '@/ai-chat/threads/utils/mergeAiChatThreadParticipants';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const AiChatThreadParticipantsSyncEffect = () => {
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

  return null;
};
