import { isDefined } from 'twenty-shared/utils';

import { type AiChatUserCreditsUsage } from '@/ai-chat/usage/types/AiChatUserCreditsUsage';

export const isAiChatUserCreditsExhausted = ({
  limitValue,
  consumedValue,
}: AiChatUserCreditsUsage): boolean =>
  isDefined(consumedValue) && consumedValue >= limitValue;
