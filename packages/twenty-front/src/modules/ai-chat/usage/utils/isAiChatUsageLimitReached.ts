import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsage } from '@/ai-chat/usage/types/AiChatUsage';

export const isAiChatUsageLimitReached = (usage: AiChatUsage | null): boolean =>
  isDefined(usage) &&
  usage.kind === 'limit' &&
  isDefined(usage.consumedValue) &&
  usage.consumedValue >= usage.limitValue;
