import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  SETU_AI_ERROR_CODES,
  type SetuAiErrorCode,
  type SetuAiTaskProjection,
  type SetuAiTaskStepProjection,
} from 'twenty-shared/ai';
import { v4 } from 'uuid';

import { AI_ACTION_STATE_REFETCH_EVENT_NAME } from '@/ai/constants/AiActionStateRefetchEventName';
import { ANSWER_AI_TASK_INPUT } from '@/ai/graphql/mutations/answerAiTaskInput';
import { CANCEL_AI_TASK } from '@/ai/graphql/mutations/cancelAiTask';
import { RETRY_AI_TASK_STEP } from '@/ai/graphql/mutations/retryAiTaskStep';
import { aiTaskStateFamilyState } from '@/ai/states/aiTaskStateFamilyState';
import { toAiTaskStateEntry } from '@/ai/utils/toAiTaskStateEntry';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import {
  type AiTaskState,
  type AnswerAiTaskInputMutation,
  type CancelAiTaskMutation,
  type RetryAiTaskStepMutation,
} from '~/generated-metadata/graphql';

export type AiTaskOperationResult =
  | { isSuccessful: true }
  | { isSuccessful: false; errorCode: SetuAiErrorCode | null };

const getErrorCode = (error: unknown): SetuAiErrorCode | null => {
  if (!CombinedGraphQLErrors.is(error)) {
    return null;
  }

  const subCode = error.errors[0]?.extensions?.subCode;

  return SETU_AI_ERROR_CODES.includes(subCode as SetuAiErrorCode)
    ? (subCode as SetuAiErrorCode)
    : null;
};

// Pessimistic like the review card: only the server's answer changes what
// the task card shows. A conflict refetches the latest state.
export const useAiTaskOperations = (taskId: string) => {
  const apolloClient = useApolloClient();
  const store = useStore();

  const run = useCallback(
    async (
      mutate: () => Promise<
        Pick<AiTaskState, 'isAvailable' | 'task'> | undefined
      >,
    ): Promise<AiTaskOperationResult> => {
      try {
        const state = await mutate();

        if (state !== undefined) {
          store.set(
            aiTaskStateFamilyState.atomFamily(taskId),
            toAiTaskStateEntry(state),
          );
        }

        return { isSuccessful: true };
      } catch (error) {
        dispatchBrowserEvent(AI_ACTION_STATE_REFETCH_EVENT_NAME, {
          taskIds: [taskId],
        });

        return { isSuccessful: false, errorCode: getErrorCode(error) };
      }
    },
    [taskId, store],
  );

  const answer = useCallback(
    (step: SetuAiTaskStepProjection, values: Record<string, unknown>) =>
      run(async () => {
        if (step.pendingInput === null) {
          return undefined;
        }

        const { data } = await apolloClient.mutate<AnswerAiTaskInputMutation>({
          mutation: ANSWER_AI_TASK_INPUT,
          variables: {
            input: {
              taskId,
              stepId: step.id,
              inputVersion: step.pendingInput.version,
              values,
              clientRequestId: v4(),
            },
          },
        });

        return data?.answerAiTaskInput;
      }),
    [apolloClient, run, taskId],
  );

  const retry = useCallback(
    (step: SetuAiTaskStepProjection) =>
      run(async () => {
        const { data } = await apolloClient.mutate<RetryAiTaskStepMutation>({
          mutation: RETRY_AI_TASK_STEP,
          variables: {
            input: {
              taskId,
              stepId: step.id,
              expectedStateVersion: step.stateVersion,
              clientRequestId: v4(),
            },
          },
        });

        return data?.retryAiTaskStep;
      }),
    [apolloClient, run, taskId],
  );

  const cancel = useCallback(
    (task: SetuAiTaskProjection) =>
      run(async () => {
        const { data } = await apolloClient.mutate<CancelAiTaskMutation>({
          mutation: CANCEL_AI_TASK,
          variables: {
            input: {
              taskId,
              expectedStateVersion: task.stateVersion,
              clientRequestId: v4(),
            },
          },
        });

        return data?.cancelAiTask;
      }),
    [apolloClient, run, taskId],
  );

  return { answer, retry, cancel };
};
