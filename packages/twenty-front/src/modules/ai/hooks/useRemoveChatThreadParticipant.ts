import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/primitives/feedback';

import { agentChatThreadParticipantsComponentFamilyState } from '@/ai/states/agentChatThreadParticipantsComponentFamilyState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { RemoveChatThreadParticipantDocument } from '~/generated-metadata/graphql';

export const useRemoveChatThreadParticipant = (threadId: string) => {
  const { enqueueToast } = useToast();
  const setAgentChatThreadParticipants = useSetAtomComponentFamilyState(
    agentChatThreadParticipantsComponentFamilyState,
    { threadId },
  );

  const [removeChatThreadParticipantMutation] = useMutation(
    RemoveChatThreadParticipantDocument,
  );

  const removeChatThreadParticipant = async (
    userWorkspaceId: string,
  ): Promise<boolean> => {
    try {
      const { data } = await removeChatThreadParticipantMutation({
        variables: { threadId, userWorkspaceId },
      });

      if (!data?.removeChatThreadParticipant) {
        return false;
      }

      setAgentChatThreadParticipants((previousParticipants) =>
        previousParticipants.filter(
          (participant) => participant.userWorkspaceId !== userWorkspaceId,
        ),
      );

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  return { removeChatThreadParticipant };
};
