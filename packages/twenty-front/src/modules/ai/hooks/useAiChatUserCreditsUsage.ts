import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { computeDaysUntilReset } from '@/ai/utils/computeDaysUntilReset';
import { isAiChatUserCreditsExhausted } from '@/ai/utils/isAiChatUserCreditsExhausted';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  GetAiChatUsageDocument,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';

export const useAiChatUserCreditsUsage = ({
  skip = false,
}: { skip?: boolean } = {}) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { data } = useQuery(GetAiChatUsageDocument, {
    skip,
    fetchPolicy: 'cache-and-network',
  });

  const aiChatUserCreditsUsage = data?.aiChatUserCreditsUsage;

  if (!isDefined(aiChatUserCreditsUsage)) {
    return { userCreditsUsage: null };
  }

  const usage = {
    limitValue: Number(aiChatUserCreditsUsage.limitValue),
    consumedValue: isDefined(aiChatUserCreditsUsage.consumedValue)
      ? Number(aiChatUserCreditsUsage.consumedValue)
      : null,
    periodEnd: aiChatUserCreditsUsage.periodEnd,
  };

  const daysUntilReset = computeDaysUntilReset(usage.periodEnd);

  return {
    userCreditsUsage: {
      ...usage,
      daysUntilReset,
      isExhausted: isAiChatUserCreditsExhausted(usage) && daysUntilReset > 0,
      isFallingBackToWorkspaceCredits:
        currentWorkspace?.billingCustomer?.userCreditsFallback !==
        UserCreditsFallback.STOP,
    },
  };
};
