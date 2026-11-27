import { AiChatErrorCode } from '@/ai-chat/utils/aiChatErrorCode';
import { getAiChatQuotaExhaustedKind } from '@/ai-chat/usage/utils/getAiChatQuotaExhaustedKind';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const isAiChatCreditsExhaustedError = (error: unknown): boolean =>
  isGraphqlErrorOfType(error, AiChatErrorCode.CREDITS_EXHAUSTED) ||
  getAiChatQuotaExhaustedKind(error) === 'workspaceAllowance';
