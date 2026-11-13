import { useStore } from 'jotai';
import { useCallback } from 'react';

import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { aiChatThreadStreamedParticipantsState } from '@/ai/states/aiChatThreadStreamedParticipantsState';
import { mergeAiChatThreadParticipants } from '@/ai/utils/mergeAiChatThreadParticipants';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// The member's inbox state comes with the threads it belongs to
export const useAddAiChatThreadParticipants = () => {
  const store = useStore();

  const addAiChatThreadParticipants = useCallback(
    (participants: AgentChatThreadParticipantFieldsFragment[]) => {
      store.set(aiChatThreadParticipantsState.atom, (loadedParticipants) =>
        mergeAiChatThreadParticipants(
          mergeAiChatThreadParticipants(loadedParticipants ?? {}, participants),
          Object.values(store.get(aiChatThreadStreamedParticipantsState.atom)),
        ),
      );
    },
    [store],
  );

  return { addAiChatThreadParticipants };
};
