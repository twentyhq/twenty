import { useCallback } from 'react';

import { ANSWER_ASK } from '@/input-ask/graphql/mutations/answerAsk';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type AnswerAskMutation,
  type AnswerAskMutationVariables,
} from '~/generated/graphql';

export const useAnswerAsk = () => {
  const apolloCoreClient = useApolloCoreClient();

  const answerAsk = useCallback(
    async ({
      askId,
      response,
      modelId,
    }: {
      askId: string;
      response: Record<string, unknown>;
      modelId?: string;
    }) => {
      const { data } = await apolloCoreClient.mutate<
        AnswerAskMutation,
        AnswerAskMutationVariables
      >({
        mutation: ANSWER_ASK,
        variables: { input: { askId, response, modelId } },
      });

      return { streamId: data?.answerAsk.streamId ?? null };
    },
    [apolloCoreClient],
  );

  return { answerAsk };
};
