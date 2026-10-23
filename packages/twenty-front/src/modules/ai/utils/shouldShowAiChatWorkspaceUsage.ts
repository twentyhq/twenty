import { isDefined } from 'twenty-shared/utils';

import { type AiChatUserCreditsUsage } from '@/ai/types/AiChatUserCreditsUsage';
import { UserCreditsFallback } from '~/generated-metadata/graphql';

export const shouldShowAiChatWorkspaceUsage = ({
  userCreditsUsage,
  userCreditsFallback,
}: {
  userCreditsUsage: AiChatUserCreditsUsage | null;
  userCreditsFallback: UserCreditsFallback | null;
}): boolean => {
  const hasUserCreditsLeft =
    !isDefined(userCreditsUsage) ||
    !isDefined(userCreditsUsage.consumedValue) ||
    userCreditsUsage.consumedValue < userCreditsUsage.limitValue;

  return hasUserCreditsLeft || userCreditsFallback !== UserCreditsFallback.STOP;
};
