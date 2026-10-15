import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { agentChatMessageReactionsFamilyState } from '@/ai/states/agentChatMessageReactionsFamilyState';
import { setAgentMessageReaction } from '@/ai/utils/setAgentMessageReaction';
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

  // Live snapshots carry the server's state, so a refused change only takes back its own reaction
  const toggleAgentChatMessageReaction = useCallback(
    async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;

      if (!isDefined(workspaceMemberId)) {
        return;
      }

      const reactionsAtom = agentChatMessageReactionsFamilyState.atomFamily({
        messageId,
      });
      const hasReacted = store
        .get(reactionsAtom)
        .some(
          (reaction) =>
            reaction.emoji === emoji &&
            reaction.workspaceMemberIds.includes(workspaceMemberId),
        );

      const setOwnReaction = (isReacted: boolean) =>
        store.set(
          reactionsAtom,
          setAgentMessageReaction({
            reactions: store.get(reactionsAtom),
            emoji,
            workspaceMemberId,
            isReacted,
          }),
        );

      setOwnReaction(!hasReacted);

      try {
        await apolloClient.mutate({
          mutation: hasReacted
            ? RemoveAgentChatMessageReactionDocument
            : AddAgentChatMessageReactionDocument,
          variables: { messageId, emoji },
        });
      } catch (error) {
        setOwnReaction(hasReacted);
        enqueueToast(getToastOptionsFromError({ error }));
      }
    },
    [apolloClient, enqueueToast, store],
  );

  return { toggleAgentChatMessageReaction };
};
