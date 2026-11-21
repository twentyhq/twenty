import { type WatchQueryFetchPolicy } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsage } from '@/ai-chat/usage/types/AiChatUsage';
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

  const aiChatThreadFetchedUsage = data?.aiChatThreadFetchedUsage;

  const usage: AiChatUsage | null = isDefined(aiChatThreadFetchedUsage)
    ? {
        limitValue: Number(aiChatThreadFetchedUsage.limitValue),
        consumedValue: isDefined(aiChatThreadFetchedUsage.consumedValue)
          ? Number(aiChatThreadFetchedUsage.consumedValue)
          : null,
        periodEnd: aiChatThreadFetchedUsage.periodEnd ?? null,
        kind: aiChatThreadFetchedUsage.kind,
      }
    : null;

  return { usage, loading, error };
};
