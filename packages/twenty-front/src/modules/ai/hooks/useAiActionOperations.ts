import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  SETU_AI_ERROR_CODES,
  type SetuAiActionProjection,
  type SetuAiErrorCode,
} from 'twenty-shared/ai';
import { v4 } from 'uuid';

import { AI_ACTION_STATE_REFETCH_EVENT_NAME } from '@/ai/constants/AiActionStateRefetchEventName';
import { CANCEL_AI_ACTION } from '@/ai/graphql/mutations/cancelAiAction';
import { DECIDE_AI_ACTION } from '@/ai/graphql/mutations/decideAiAction';
import { REVISE_AI_ACTION } from '@/ai/graphql/mutations/reviseAiAction';
import { aiActionStateFamilyState } from '@/ai/states/aiActionStateFamilyState';
import { toAiActionStateEntry } from '@/ai/utils/toAiActionStateEntry';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import {
  type AiActionState,
  type CancelAiActionMutation,
  type DecideAiActionMutation,
  type ReviseAiActionMutation,
} from '~/generated-metadata/graphql';

export type AiActionOperationResult =
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

// Pessimistic: a click only shows "submitting"; the server's answer is the
// new state. Conflicts refetch the card so the latest version is shown.
export const useAiActionOperations = (requestedId: string) => {
  const apolloClient = useApolloClient();
  const store = useStore();

  const run = useCallback(
    async (
      mutate: () => Promise<
        Pick<AiActionState, 'isAvailable' | 'action'> | undefined
      >,
    ): Promise<AiActionOperationResult> => {
      try {
        const state = await mutate();

        if (state !== undefined) {
          store.set(
            aiActionStateFamilyState.atomFamily(requestedId),
            toAiActionStateEntry(state),
          );
        }

        return { isSuccessful: true };
      } catch (error) {
        dispatchBrowserEvent(AI_ACTION_STATE_REFETCH_EVENT_NAME, {
          actionRequestIds: [requestedId],
        });

        return { isSuccessful: false, errorCode: getErrorCode(error) };
      }
    },
    [requestedId, store],
  );

  const decide = useCallback(
    (action: SetuAiActionProjection, decision: 'approve' | 'reject') =>
      run(async () => {
        const { data } = await apolloClient.mutate<DecideAiActionMutation>({
          mutation: DECIDE_AI_ACTION,
          variables: {
            input: {
              actionRequestId: action.id,
              expectedStateVersion: action.stateVersion,
              decision,
              clientRequestId: v4(),
            },
          },
        });

        return data?.decideAiAction;
      }),
    [apolloClient, run],
  );

  const cancel = useCallback(
    (action: SetuAiActionProjection) =>
      run(async () => {
        const { data } = await apolloClient.mutate<CancelAiActionMutation>({
          mutation: CANCEL_AI_ACTION,
          variables: {
            input: {
              actionRequestId: action.id,
              expectedStateVersion: action.stateVersion,
              clientRequestId: v4(),
            },
          },
        });

        return data?.cancelAiAction;
      }),
    [apolloClient, run],
  );

  const revise = useCallback(
    (action: SetuAiActionProjection, edits: Record<string, unknown>) =>
      run(async () => {
        const { data } = await apolloClient.mutate<ReviseAiActionMutation>({
          mutation: REVISE_AI_ACTION,
          variables: {
            input: {
              actionRequestId: action.id,
              expectedStateVersion: action.stateVersion,
              edits,
            },
          },
        });

        return data?.reviseAiAction;
      }),
    [apolloClient, run],
  );

  return { decide, cancel, revise };
};
