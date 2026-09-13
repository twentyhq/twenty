import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { getAiChatQuotaExhaustedKind } from '@/ai/utils/getAiChatQuotaExhaustedKind';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const isAiChatCreditsExhaustedError = (error: unknown): boolean =>
  isGraphqlErrorOfType(error, AiChatErrorCode.BILLING_CREDITS_EXHAUSTED) ||
  getAiChatQuotaExhaustedKind(error) === 'allowance';
