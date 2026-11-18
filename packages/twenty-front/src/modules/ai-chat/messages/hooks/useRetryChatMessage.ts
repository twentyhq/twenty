import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { dispatchAiChatRefetchMessagesEvent } from '@/ai-chat/utils/dispatchAiChatRefetchMessagesEvent';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useAiChatModelId } from '@/ai-chat/hooks/useAiChatModelId';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai-chat/states/aiChatIsAwaitingFirstChunkFamilyState';
import { isAiChatCreditsExhaustedError } from '@/ai-chat/usage/utils/isAiChatCreditsExhaustedError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  markWorkspaceCreditsAvailable,
  markWorkspaceCreditsExhausted,
} from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import { RetryChatMessageDocument } from '~/generated-metadata/graphql';

export const useRetryChatMessage = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { modelIdForRequest } = useAiChatModelId();
  const { threadId } = useAiChatInstanceOrThrow();

  const retryChatMessage = useCallback(async () => {
    const errorAtom = aiChatErrorFamilyState.atomFamily({ threadId });
    const isAwaitingFirstChunkAtom =
      aiChatIsAwaitingFirstChunkFamilyState.atomFamily({ threadId });
    const previousError = store.get(errorAtom);

    store.set(errorAtom, null);
    store.set(isAwaitingFirstChunkAtom, true);

    try {
      await apolloClient.mutate({
        mutation: RetryChatMessageDocument,
        variables: { threadId, modelId: modelIdForRequest },
      });

      // Same guard as useAiChat: the stream may already have set a newer credits-exhausted error.
      if (!isAiChatCreditsExhaustedError(store.get(errorAtom))) {
        store.set(currentWorkspaceState.atom, markWorkspaceCreditsAvailable);
      }

      dispatchAiChatRefetchMessagesEvent(threadId);
    } catch (retryError) {
      store.set(isAwaitingFirstChunkAtom, false);
      store.set(
        errorAtom,
        retryError instanceof Error ? retryError : previousError,
      );

      if (isAiChatCreditsExhaustedError(retryError)) {
        store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);
      }
    }
  }, [apolloClient, store, modelIdForRequest, threadId]);

  return { retryChatMessage };
};
