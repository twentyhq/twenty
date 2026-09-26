import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsage } from '@/ai/types/AiChatUsage';

export const isAiChatUsageLimitReached = (usage: AiChatUsage | null): boolean =>
  isDefined(usage) &&
  usage.isUsageLimit &&
  isDefined(usage.consumedValue) &&
  usage.consumedValue >= usage.limitValue;
