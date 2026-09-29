import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { RESOLVE_TOOL_CALL } from '@/ai/core-graphql/mutations/resolveToolCall';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { findToolPartOutput } from '@/ai/utils/findToolPartOutput';
import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';
import { updateToolPartOutput } from '@/ai/utils/updateToolPartOutput';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { markWorkspaceCreditsExhausted } from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import { useToast } from 'twenty-ui/components';
import {
  type ResolveToolCallMutation,
  type ResolveToolCallMutationVariables,
} from '~/generated/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const useResolveToolCall = () => {
  const apolloCoreClient = useApolloCoreClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { modelIdForRequest } = useAgentChatModelId();

  // Returns whether the call was resolved, so a widget can keep itself
  // disabled until its Ask is gone rather than invite a second answer.
  const resolveToolCall = useCallback(
    async ({
      toolCallId,
      output,
      optimisticToolOutput,
    }: {
      toolCallId: string;
      output: Record<string, unknown>;
      optimisticToolOutput?: unknown;
    }): Promise<boolean> => {
      const threadId = store.get(agentChatDisplayedThreadState.atom);

      if (!isDefined(threadId)) {
        return false;
      }

      const messagesAtom = agentChatMessagesComponentFamilyState.atomFamily({
        instanceId: AGENT_CHAT_INSTANCE_ID,
        familyKey: { threadId },
      });
      const isAwaitingFirstChunkAtom =
        agentChatIsAwaitingFirstChunkComponentFamilyState.atomFamily({
          instanceId: AGENT_CHAT_INSTANCE_ID,
          familyKey: { threadId },
        });
      const errorAtom = agentChatErrorComponentFamilyState.atomFamily({
        instanceId: AGENT_CHAT_INSTANCE_ID,
        familyKey: { threadId },
      });

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
        const { data } = await apolloCoreClient.mutate<
          ResolveToolCallMutation,
          ResolveToolCallMutationVariables
        >({
          mutation: RESOLVE_TOOL_CALL,
          variables: {
            input: { threadId, toolCallId, output, modelId: modelIdForRequest },
          },
        });

        // A workflow run resumes in its own executor, so no chunk follows.
        if (!isDefined(data?.resolveToolCall.streamId)) {
          store.set(isAwaitingFirstChunkAtom, false);
        }

        dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);

        return true;
      } catch (error) {
        store.set(isAwaitingFirstChunkAtom, false);

        // The banner reads the workspace flag, then the thread error when no resource credit item carries that flag
        if (isAiChatCreditsExhaustedError(error)) {
          store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);
          store.set(
            errorAtom,
            CombinedGraphQLErrors.is(error) || error instanceof Error
              ? error
              : new Error('An unexpected error occurred'),
          );
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

  return { resolveToolCall };
};
