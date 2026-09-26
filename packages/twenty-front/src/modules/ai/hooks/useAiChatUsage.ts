import { type WatchQueryFetchPolicy } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsage } from '@/ai/types/AiChatUsage';
import { GetAiChatUsageDocument } from '~/generated-metadata/graphql';

export const useAiChatUsage = ({
  skip = false,
  fetchPolicy,
}: {
  skip?: boolean;
  fetchPolicy: WatchQueryFetchPolicy;
}) => {
  const { data, loading, error } = useQuery(GetAiChatUsageDocument, {
    skip,
    fetchPolicy,
  });

  const aiChatUsage = data?.aiChatUsage;

  const usage: AiChatUsage | null = isDefined(aiChatUsage)
    ? {
        limitValue: Number(aiChatUsage.limitValue),
        consumedValue: isDefined(aiChatUsage.consumedValue)
          ? Number(aiChatUsage.consumedValue)
          : null,
        periodEnd: aiChatUsage.periodEnd ?? null,
        isUsageLimit: aiChatUsage.isUsageLimit,
      }
    : null;

  return { usage, loading, error };
};
