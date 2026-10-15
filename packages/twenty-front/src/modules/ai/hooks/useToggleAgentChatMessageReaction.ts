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

type ReactionRequestQueue = {
  lastRequest: Promise<void>;
  isConfirmedReacted: boolean;
};

// Shared by every caller so one emoji's changes reach the server in the order they were made
const reactionRequestQueues = new Map<string, ReactionRequestQueue>();

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

      const queueKey = `${messageId}:${emoji}`;
      const queue = reactionRequestQueues.get(queueKey) ?? {
        lastRequest: Promise.resolve(),
        isConfirmedReacted: hasReacted,
      };

      const request = queue.lastRequest.then(async () => {
        try {
          await apolloClient.mutate({
            mutation: hasReacted
              ? RemoveAgentChatMessageReactionDocument
              : AddAgentChatMessageReactionDocument,
            variables: { messageId, emoji },
          });
          queue.isConfirmedReacted = !hasReacted;
        } catch (error) {
          // A newer change is still on its way and will settle the reaction
          if (queue.lastRequest === request) {
            setOwnReaction(queue.isConfirmedReacted);
          }
          enqueueToast(getToastOptionsFromError({ error }));
        }
      });

      queue.lastRequest = request;
      reactionRequestQueues.set(queueKey, queue);

      await request;

      if (queue.lastRequest === request) {
        reactionRequestQueues.delete(queueKey);
      }
    },
    [apolloClient, enqueueToast, store],
  );

  return { toggleAgentChatMessageReaction };
};
