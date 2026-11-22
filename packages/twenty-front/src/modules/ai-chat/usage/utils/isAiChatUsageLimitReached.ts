import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsage } from '@/ai-chat/usage/types/AiChatUsage';
import { isAiChatUserCreditsExhausted } from '@/ai-chat/usage/utils/isAiChatUserCreditsExhausted';

export const isAiChatUsageLimitReached = (usage: AiChatUsage | null): boolean =>
  isDefined(usage) &&
  usage.kind === 'limit' &&
  isAiChatUserCreditsExhausted(usage);
