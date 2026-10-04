import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useToast } from 'twenty-ui/components';

import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { filterNewParticipantMentions } from '@/ai/utils/filterNewParticipantMentions';
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
      const participantMentions = filterNewParticipantMentions({
        participantMentions:
          getParticipantMentionsFromSerializedDocument(serializedMessage),
        thread: store.get(
          agentChatThreadRecordFamilySelector.selectorFamily(threadId),
        ),
        currentWorkspaceMemberId: store.get(currentWorkspaceMemberState.atom)
          ?.id,
      });

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

        if (notAddedLabels !== '') {
          enqueueToast({
            variant: 'warning',
            children: t`${notAddedLabels} could not be added to this chat because they don't have access to it.`,
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
