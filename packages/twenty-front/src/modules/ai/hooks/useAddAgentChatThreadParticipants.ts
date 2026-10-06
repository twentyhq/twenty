import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { getParticipantMentionsFromSerializedDocument } from '@/ai/utils/getParticipantMentionsFromSerializedDocument';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { AddAgentChatThreadParticipantsDocument } from '~/generated-metadata/graphql';

export const useAddAgentChatThreadParticipants = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();

  const addParticipantsMentionedInMessage = useCallback(
    async ({
      threadId,
      serializedMessage,
    }: {
      threadId: string;
      serializedMessage: string;
    }) => {
      const currentWorkspaceMemberId = store.get(
        currentWorkspaceMemberState.atom,
      )?.id;
      // Members already following are sent too, so the mention brings the
      // chat back to their inbox
      const participantMentions = getParticipantMentionsFromSerializedDocument(
        serializedMessage,
      ).filter(
        ({ workspaceMemberId }) =>
          workspaceMemberId !== currentWorkspaceMemberId,
      );

      if (participantMentions.length === 0) {
        return;
      }

      try {
        const { data } = await apolloClient.mutate({
          mutation: AddAgentChatThreadParticipantsDocument,
          variables: {
            threadId,
            workspaceMemberIds: participantMentions.map(
              ({ workspaceMemberId }) => workspaceMemberId,
            ),
          },
        });

        const addedWorkspaceMemberIds =
          data?.addAgentChatThreadParticipants ?? [];
        const notAddedLabels = participantMentions
          .filter(
            ({ workspaceMemberId }) =>
              !addedWorkspaceMemberIds.includes(workspaceMemberId),
          )
          .map(({ label }) => label)
          .join(', ');

        if (isNonEmptyString(notAddedLabels)) {
          enqueueToast({
            variant: 'warning',
            children: t`${notAddedLabels} could not be added to this chat because they can't reply in it.`,
          });
        }
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
      }
    },
    [apolloClient, enqueueToast, store],
  );

  return { addParticipantsMentionedInMessage };
};
