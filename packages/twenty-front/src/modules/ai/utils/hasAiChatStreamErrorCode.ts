import { isNonEmptyString } from '@sniptt/guards';

import { type AiChatError } from '@/ai/types/AiChatError';

// Stream-pipeline errors are created with createAiChatCodedError and carry a code;
// only those correspond to a server-side lastStreamError that retryChatMessage can retry.
export const hasAiChatStreamErrorCode = (error: AiChatError): boolean =>
  isNonEmptyString((error as Error & { code?: string }).code);
