import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';

import { agentChatThreadParticipantsComponentFamilyState } from '@/ai/states/agentChatThreadParticipantsComponentFamilyState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { AddChatThreadParticipantDocument } from '~/generated-metadata/graphql';

export const useAddChatThreadParticipant = (threadId: string) => {
  const { enqueueToast } = useToast();
  const setAgentChatThreadParticipants = useSetAtomComponentFamilyState(
    agentChatThreadParticipantsComponentFamilyState,
    { threadId },
  );

  const [addChatThreadParticipantMutation] = useMutation(
    AddChatThreadParticipantDocument,
  );

  const addChatThreadParticipant = async (
    userWorkspaceId: string,
  ): Promise<boolean> => {
    try {
      const { data } = await addChatThreadParticipantMutation({
        variables: { threadId, userWorkspaceId },
      });

      const participant = data?.addChatThreadParticipant;

      if (!isDefined(participant)) {
        return false;
      }

      setAgentChatThreadParticipants((previousParticipants) =>
        previousParticipants.some(
          (previousParticipant) => previousParticipant.id === participant.id,
        )
          ? previousParticipants
          : [...previousParticipants, participant],
      );

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  return { addChatThreadParticipant };
};
