import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { AnswerToolCallDocument } from '~/generated/graphql';

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
      const { data } = await apolloCoreClient.mutate({
        mutation: AnswerToolCallDocument,
        variables: { input: { threadId, toolCallId, response, modelId } },
      });

      return { streamId: data?.answerToolCall.streamId ?? null };
    },
    [apolloCoreClient],
  );

  return { answerToolCall };
};
