import { isNonEmptyString } from '@sniptt/guards';

import { type AiChatError } from '@/ai/types/AiChatError';

export const isRetryableAiChatStreamError = (error: AiChatError): boolean =>
  isNonEmptyString((error as Error & { code?: string }).code);
