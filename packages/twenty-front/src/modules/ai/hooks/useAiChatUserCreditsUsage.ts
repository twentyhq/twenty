import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatUserCreditsUsage } from '@/ai/types/AiChatUserCreditsUsage';
import { GetAiChatUserCreditsUsageDocument } from '~/generated-metadata/graphql';

export const useAiChatUserCreditsUsage = ({
  skip = false,
}: { skip?: boolean } = {}) => {
  const { data } = useQuery(GetAiChatUserCreditsUsageDocument, {
    skip,
    fetchPolicy: 'cache-and-network',
  });

  const aiChatUserCreditsUsage = data?.aiChatUserCreditsUsage;

  const userCreditsUsage: AiChatUserCreditsUsage | null = isDefined(
    aiChatUserCreditsUsage,
  )
    ? {
        limitValue: Number(aiChatUserCreditsUsage.limitValue),
        consumedValue: isDefined(aiChatUserCreditsUsage.consumedValue)
          ? Number(aiChatUserCreditsUsage.consumedValue)
          : null,
        periodEnd: aiChatUserCreditsUsage.periodEnd,
      }
    : null;

  return { userCreditsUsage };
};
