import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { isAiChatIncludedChatPausedError } from '@/ai/utils/isAiChatIncludedChatPausedError';
import { getGraphqlErrorExtensionsFromError } from '~/utils/get-graphql-error-extensions-from-error.util';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

// An unreadable refusal is reported as a limit: guessing 'allowance' would flip the workspace into the upgrade banner
export const getAiChatQuotaExhaustedKind = (
  error: unknown,
): 'limit' | 'allowance' | null => {
  // The pause travels as QUOTA_EXHAUSTED, but it is neither a limit the member can manage nor the allowance
  if (
    !isGraphqlErrorOfType(error, AiChatErrorCode.QUOTA_EXHAUSTED) ||
    isAiChatIncludedChatPausedError(error)
  ) {
    return null;
  }

  return getGraphqlErrorExtensionsFromError(error)?.exhaustedKind ===
    'allowance'
    ? 'allowance'
    : 'limit';
};
