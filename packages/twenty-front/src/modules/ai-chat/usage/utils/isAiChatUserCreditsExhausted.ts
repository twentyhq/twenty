import { isDefined } from 'twenty-shared/utils';

import { type AiChatUserCreditsUsage } from '@/ai-chat/usage/types/AiChatUserCreditsUsage';

export const isAiChatUserCreditsExhausted = ({
  limitValue,
  consumedValue,
}: Pick<AiChatUserCreditsUsage, 'limitValue' | 'consumedValue'>): boolean =>
  isDefined(consumedValue) && consumedValue >= limitValue;
