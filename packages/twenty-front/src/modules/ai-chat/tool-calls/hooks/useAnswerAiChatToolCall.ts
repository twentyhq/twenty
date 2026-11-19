import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { dispatchAiChatRefetchMessagesEvent } from '@/ai-chat/utils/dispatchAiChatRefetchMessagesEvent';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatModelId } from '@/ai-chat/hooks/useAiChatModelId';
import { AiChatErrorCode } from '@/ai-chat/utils/aiChatErrorCode';
import { findToolPartOutput } from '@/ai-chat/tool-calls/utils/findToolPartOutput';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai-chat/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { isAiChatCreditsExhaustedError } from '@/ai-chat/usage/utils/isAiChatCreditsExhaustedError';
import { toAiChatError } from '@/ai-chat/utils/toAiChatError';
import { updateToolPartOutput } from '@/ai-chat/tool-calls/utils/updateToolPartOutput';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { markWorkspaceCreditsExhausted } from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import { useToast } from 'twenty-ui/components/feedback';
import { AnswerToolCallDocument } from '~/generated/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const useAnswerAiChatToolCall = () => {
  const apolloCoreClient = useApolloCoreClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { modelIdForRequest } = useAiChatModelId();
  const { threadId: aiChatThreadId } = useAiChatInstanceOrThrow();

  // Returns whether answered, so a card stays disabled until the call closes.
  const answerAiChatToolCall = useCallback(
    async ({
      toolCallId,
      response,
      optimisticToolOutput,
      threadId = aiChatThreadId,
    }: {
      toolCallId: string;
      response: Record<string, unknown>;
      optimisticToolOutput?: unknown;
      threadId?: string | null;
    }): Promise<boolean> => {
      if (!isDefined(threadId)) {
        return false;
      }

      const messagesAtom = aiChatMessagesFamilyState.atomFamily({
        threadId,
      });
      const errorAtom = aiChatErrorFamilyState.atomFamily({ threadId });
      const isAwaitingFirstChunkAtom =
        aiChatIsAwaitingFirstChunkFamilyState.atomFamily({ threadId });

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

        dispatchAiChatRefetchMessagesEvent(threadId);

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
          dispatchAiChatRefetchMessagesEvent(threadId);
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
    [apolloCoreClient, store, enqueueToast, modelIdForRequest, aiChatThreadId],
  );

  return { answerAiChatToolCall };
};
