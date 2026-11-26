import { type WatchQueryFetchPolicy } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsage } from '@/ai-chat/usage/types/AiChatUsage';
import { mapAiChatUsageCounters } from '@/ai-chat/usage/utils/mapAiChatUsageCounters';
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
        ...mapAiChatUsageCounters(aiChatUsage),
        periodEnd: aiChatUsage.periodEnd ?? null,
        kind: aiChatUsage.kind,
      }
    : null;

  return { usage, loading, error };
};
