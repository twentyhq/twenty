import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { getAgentChatThreadAtoms } from '@/ai/utils/getAgentChatThreadAtoms';
import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import {
  markWorkspaceCreditsAvailable,
  markWorkspaceCreditsExhausted,
} from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import { RetryChatMessageDocument } from '~/generated-metadata/graphql';

export const useRetryChatMessage = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { modelIdForRequest } = useAgentChatModelId();

  const retryChatMessage = useCallback(async () => {
    const threadId = store.get(agentChatDisplayedThreadState.atom);

    if (!isDefined(threadId)) {
      return;
    }

    const { errorAtom, isAwaitingFirstChunkAtom } =
      getAgentChatThreadAtoms(threadId);
    const previousError = store.get(errorAtom);

    store.set(errorAtom, null);
    store.set(isAwaitingFirstChunkAtom, true);

    try {
      const { data } = await apolloClient.mutate({
        mutation: RetryChatMessageDocument,
        variables: { threadId, modelId: modelIdForRequest },
      });

      // Same guards as useAgentChat: the stream may already have set a newer credits-exhausted error.
      if (
        data?.retryChatMessage.isIncluded !== true &&
        !isAiChatCreditsExhaustedError(store.get(errorAtom))
      ) {
        store.set(currentWorkspaceState.atom, markWorkspaceCreditsAvailable);
      }

      dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
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
  }, [apolloClient, store, modelIdForRequest]);

  return { retryChatMessage };
};
