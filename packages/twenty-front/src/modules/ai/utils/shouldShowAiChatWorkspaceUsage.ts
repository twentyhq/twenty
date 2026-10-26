import { isDefined } from 'twenty-shared/utils';

import { type AiChatUserCreditsUsage } from '@/ai/types/AiChatUserCreditsUsage';
import { isAiChatUserCreditsExhausted } from '@/ai/utils/isAiChatUserCreditsExhausted';
import { UserCreditsFallback } from '~/generated-metadata/graphql';

export const shouldShowAiChatWorkspaceUsage = ({
  userCreditsUsage,
  userCreditsFallback,
}: {
  userCreditsUsage: AiChatUserCreditsUsage | null;
  userCreditsFallback: UserCreditsFallback | null;
}): boolean =>
  !isDefined(userCreditsUsage) ||
  !isAiChatUserCreditsExhausted(userCreditsUsage) ||
  userCreditsFallback !== UserCreditsFallback.STOP;
