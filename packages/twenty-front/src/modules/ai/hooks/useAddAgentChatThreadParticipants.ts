import { useStore } from 'jotai';
import { useCallback } from 'react';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { mergeAgentChatThreadParticipants } from '@/ai/utils/mergeAgentChatThreadParticipants';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// The member's inbox state comes with the threads it belongs to
export const useAddAgentChatThreadParticipants = () => {
  const store = useStore();

  const addAgentChatThreadParticipants = useCallback(
    (participants: AgentChatThreadParticipantFieldsFragment[]) => {
      store.set(agentChatThreadParticipantsState.atom, (loadedParticipants) =>
        mergeAgentChatThreadParticipants(
          mergeAgentChatThreadParticipants(
            loadedParticipants ?? {},
            participants,
          ),
          Object.values(
            store.get(agentChatThreadStreamedParticipantsState.atom),
          ),
        ),
      );
    },
    [store],
  );

  return { addAgentChatThreadParticipants };
};
