import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { agentChatMessageReactionsFamilyState } from '@/ai/states/agentChatMessageReactionsFamilyState';
import { toggleAgentMessageReaction } from '@/ai/utils/toggleAgentMessageReaction';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  AddAgentChatMessageReactionDocument,
  RemoveAgentChatMessageReactionDocument,
} from '~/generated-metadata/graphql';

export const useToggleAgentChatMessageReaction = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();

  // The reaction shows right away and is put back if the server refuses it
  const toggleAgentChatMessageReaction = useCallback(
    async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;

      if (!isDefined(workspaceMemberId)) {
        return;
      }

      const reactionsAtom = agentChatMessageReactionsFamilyState.atomFamily({
        messageId,
      });
      const previousReactions = store.get(reactionsAtom);
      const hasReacted = previousReactions.some(
        (reaction) =>
          reaction.emoji === emoji &&
          reaction.workspaceMemberIds.includes(workspaceMemberId),
      );

      store.set(
        reactionsAtom,
        toggleAgentMessageReaction({
          reactions: previousReactions,
          emoji,
          workspaceMemberId,
        }),
      );

      try {
        if (hasReacted) {
          const { data } = await apolloClient.mutate({
            mutation: RemoveAgentChatMessageReactionDocument,
            variables: { messageId, emoji },
          });

          if (isDefined(data)) {
            store.set(reactionsAtom, data.removeAgentChatMessageReaction);
          }

          return;
        }

        const { data } = await apolloClient.mutate({
          mutation: AddAgentChatMessageReactionDocument,
          variables: { messageId, emoji },
        });

        if (isDefined(data)) {
          store.set(reactionsAtom, data.addAgentChatMessageReaction);
        }
      } catch (error) {
        store.set(reactionsAtom, previousReactions);
        enqueueToast(getToastOptionsFromError({ error }));
      }
    },
    [apolloClient, enqueueToast, store],
  );

  return { toggleAgentChatMessageReaction };
};
