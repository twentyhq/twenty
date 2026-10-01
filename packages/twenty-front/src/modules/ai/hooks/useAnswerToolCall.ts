import { useCallback } from 'react';

import { ANSWER_TOOL_CALL } from '@/ai/graphql/mutations/answerToolCall';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type AnswerToolCallMutation,
  type AnswerToolCallMutationVariables,
} from '~/generated/graphql';

export const useAnswerToolCall = () => {
  const apolloCoreClient = useApolloCoreClient();

  const answerToolCall = useCallback(
    async ({
      threadId,
      toolCallId,
      response,
      modelId,
    }: {
      threadId: string;
      toolCallId: string;
      response: Record<string, unknown>;
      modelId?: string;
    }) => {
      const { data } = await apolloCoreClient.mutate<
        AnswerToolCallMutation,
        AnswerToolCallMutationVariables
      >({
        mutation: ANSWER_TOOL_CALL,
        variables: { input: { threadId, toolCallId, response, modelId } },
      });

      return { streamId: data?.answerToolCall.streamId ?? null };
    },
    [apolloCoreClient],
  );

  return { answerToolCall };
};
