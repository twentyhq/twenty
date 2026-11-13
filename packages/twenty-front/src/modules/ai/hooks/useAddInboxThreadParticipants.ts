import { useStore } from 'jotai';
import { useCallback } from 'react';

import { inboxThreadParticipantsState } from '@/ai/states/inboxThreadParticipantsState';
import { inboxThreadStreamedParticipantsState } from '@/ai/states/inboxThreadStreamedParticipantsState';
import { mergeInboxThreadParticipants } from '@/ai/utils/mergeInboxThreadParticipants';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// The member's inbox state comes with the threads it belongs to
export const useAddInboxThreadParticipants = () => {
  const store = useStore();

  const addInboxThreadParticipants = useCallback(
    (participants: AgentChatThreadParticipantFieldsFragment[]) => {
      store.set(inboxThreadParticipantsState.atom, (loadedParticipants) =>
        mergeInboxThreadParticipants(
          mergeInboxThreadParticipants(loadedParticipants ?? {}, participants),
          Object.values(store.get(inboxThreadStreamedParticipantsState.atom)),
        ),
      );
    },
    [store],
  );

  return { addInboxThreadParticipants };
};
