import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { refetchAiChatThreadMessages } from '@/ai-chat/utils/refetchAiChatThreadMessages';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { endAiChatReplyStatus } from '@/ai-chat/utils/endAiChatReplyStatus';
import { getAiChatModelIdForRequest } from '@/ai-chat/utils/getAiChatModelIdForRequest';
import { getAiChatReplyStatusUnlessStreaming } from '@/ai-chat/utils/getAiChatReplyStatusUnlessStreaming';
import { isAiChatCreditsExhaustedError } from '@/ai-chat/usage/utils/isAiChatCreditsExhaustedError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  markWorkspaceCreditsAvailable,
  markWorkspaceCreditsExhausted,
} from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import { RetryChatMessageDocument } from '~/generated-metadata/graphql';

export const useRetryAiChatMessage = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { threadId } = useAiChatInstanceOrThrow();

  const retryChatMessage = useCallback(async () => {
    const errorAtom = aiChatThreadReplyErrorFamilyState.atomFamily({
      threadId,
    });
    const replyStatusAtom = aiChatThreadReplyStatusFamilyState.atomFamily({
      threadId,
    });
    const previousError = store.get(errorAtom);

    store.set(errorAtom, null);
    store.set(
      replyStatusAtom,
      getAiChatReplyStatusUnlessStreaming('awaiting-first-chunk'),
    );

    try {
      await apolloClient.mutate({
        mutation: RetryChatMessageDocument,
        variables: { threadId, modelId: getAiChatModelIdForRequest(store) },
      });

      if (!isAiChatCreditsExhaustedError(store.get(errorAtom))) {
        store.set(currentWorkspaceState.atom, markWorkspaceCreditsAvailable);
      }

      refetchAiChatThreadMessages(threadId);
    } catch (retryError) {
      store.set(replyStatusAtom, endAiChatReplyStatus('awaiting-first-chunk'));
      store.set(
        errorAtom,
        retryError instanceof Error ? retryError : previousError,
      );

      if (isAiChatCreditsExhaustedError(retryError)) {
        store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);
      }
    }
  }, [apolloClient, store, threadId]);

  return { retryChatMessage };
};
