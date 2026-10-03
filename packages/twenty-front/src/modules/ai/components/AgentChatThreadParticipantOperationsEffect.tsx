import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// The member's inbox state follows what they do in their other tabs and
// devices, and snoozes the server ends
export const AgentChatThreadParticipantOperationsEffect = () => {
  const store = useStore();

  const handleParticipantOperation = useCallback(
    ({
      operation,
    }: MetadataOperationBrowserEventDetail<AgentChatThreadParticipantFieldsFragment>) => {
      if (operation.type !== 'update') {
        return;
      }

      const { updatedRecord: participant } = operation;

      // Before the first load there is nothing to keep up to date
      store.set(agentChatThreadParticipantsState.atom, (participants) =>
        isDefined(participants)
          ? { ...participants, [participant.threadId]: participant }
          : participants,
      );
    },
    [store],
  );

  useListenToMetadataOperationBrowserEvent<AgentChatThreadParticipantFieldsFragment>(
    {
      metadataName: 'agentChatThreadParticipant',
      onMetadataOperationBrowserEvent: handleParticipantOperation,
    },
  );

  return null;
};
