import { useStore } from 'jotai';
import { useCallback } from 'react';

import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { mergeAiChatThreadParticipants } from '@/ai-chat/threads/utils/mergeAiChatThreadParticipants';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const useAddAiChatThreadParticipants = () => {
  const store = useStore();

  const addAiChatThreadParticipants = useCallback(
    (participants: AgentChatThreadParticipantFieldsFragment[]) => {
      store.set(aiChatThreadParticipantsState.atom, (currentParticipants) => ({
        isLoaded: true,
        rowsByThreadId: mergeAiChatThreadParticipants(
          currentParticipants.rowsByThreadId,
          participants,
        ),
      }));
    },
    [store],
  );

  return { addAiChatThreadParticipants };
};
