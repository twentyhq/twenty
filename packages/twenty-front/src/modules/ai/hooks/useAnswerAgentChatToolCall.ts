import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { findToolPartOutput } from '@/ai/utils/findToolPartOutput';
import { getAgentChatThreadAtoms } from '@/ai/utils/getAgentChatThreadAtoms';
import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';
import { toAiChatError } from '@/ai/utils/toAiChatError';
import { updateToolPartOutput } from '@/ai/utils/updateToolPartOutput';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { markWorkspaceCreditsExhausted } from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import { useToast } from 'twenty-ui/components/feedback';
import { AnswerToolCallDocument } from '~/generated/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const useAnswerAgentChatToolCall = () => {
  const apolloCoreClient = useApolloCoreClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { modelIdForRequest } = useAgentChatModelId();

  // Returns whether answered, so a card stays disabled until the call closes.
  const answerAgentChatToolCall = useCallback(
    async ({
      toolCallId,
      response,
      optimisticToolOutput,
    }: {
      toolCallId: string;
      response: Record<string, unknown>;
      optimisticToolOutput?: unknown;
    }): Promise<boolean> => {
      const threadId = store.get(agentChatDisplayedThreadState.atom);

      if (!isDefined(threadId)) {
        return false;
      }

      const { messagesAtom, errorAtom, isAwaitingFirstChunkAtom } =
        getAgentChatThreadAtoms(threadId);

      const previousToolOutput = findToolPartOutput({
        messages: store.get(messagesAtom),
        toolCallId,
      });

      if (isDefined(optimisticToolOutput)) {
        store.set(messagesAtom, (messages) =>
          updateToolPartOutput({
            messages,
            toolCallId,
            output: optimisticToolOutput,
          }),
        );
      }

      store.set(isAwaitingFirstChunkAtom, true);

      try {
        const { data } = await apolloCoreClient.mutate({
          mutation: AnswerToolCallDocument,
          variables: {
            input: {
              threadId,
              toolCallId,
              response,
              modelId: modelIdForRequest,
            },
          },
        });
        const streamId = data?.answerToolCall.streamId;

        // No chunk follows when a workflow run resumes in its own executor or other calls still wait.
        if (!isDefined(streamId)) {
          store.set(isAwaitingFirstChunkAtom, false);
        }

        dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);

        return true;
      } catch (error) {
        store.set(isAwaitingFirstChunkAtom, false);

        // The banner reads the workspace flag, then the thread error when no resource credit item carries that flag
        if (isAiChatCreditsExhaustedError(error)) {
          store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);
          store.set(errorAtom, toAiChatError(error));
        }

        if (
          isGraphqlErrorOfType(error, AiChatErrorCode.TOOL_CALL_NOT_PENDING)
        ) {
          dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
        } else if (isDefined(optimisticToolOutput)) {
          store.set(messagesAtom, (messages) =>
            updateToolPartOutput({
              messages,
              toolCallId,
              output: previousToolOutput,
            }),
          );
        }

        enqueueToast(getToastOptionsFromError({ error }));

        return false;
      }
    },
    [apolloCoreClient, store, enqueueToast, modelIdForRequest],
  );

  return { answerAgentChatToolCall };
};
