import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { aiChatMessageReactionRevisionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionRevisionsFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionsFamilyState';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { setAiChatMessageReaction } from '@/ai-chat/messages/utils/setAiChatMessageReaction';
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

const reactionRequestQueues = new Map<string, ReactionRequestQueue>();

export const useToggleAiChatMessageReaction = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { threadId: aiChatThreadId } = useAiChatInstanceOrThrow();
  const { enqueueToast } = useToast();

  const toggleAiChatMessageReaction = useCallback(
    async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;

      if (!isDefined(workspaceMemberId)) {
        return;
      }

      const reactionsAtom = aiChatMessageReactionsFamilyState.atomFamily({
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
          setAiChatMessageReaction({
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

      const liveRevisionsAtom =
        aiChatMessageReactionRevisionsFamilyState.atomFamily({
          threadId: aiChatThreadId,
        });
      const readLiveRevision = () => store.get(liveRevisionsAtom)[messageId];

      const request = queue.lastRequest.then(async () => {
        const liveRevisionBeforeRequest = readLiveRevision();

        try {
          await apolloClient.mutate({
            mutation: hasReacted
              ? RemoveAgentChatMessageReactionDocument
              : AddAgentChatMessageReactionDocument,
            variables: { messageId, emoji },
          });
          queue.isConfirmedReacted = !hasReacted;
        } catch (error) {
          if (
            queue.lastRequest === request &&
            readLiveRevision() === liveRevisionBeforeRequest
          ) {
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
    [apolloClient, enqueueToast, store, aiChatThreadId],
  );

  return { toggleAiChatMessageReaction };
};
