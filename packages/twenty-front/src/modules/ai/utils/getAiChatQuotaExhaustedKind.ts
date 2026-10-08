import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { getGraphqlErrorExtensionsFromError } from '~/utils/get-graphql-error-extensions-from-error.util';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

// An unreadable refusal is reported as a limit: guessing 'allowance' would flip the workspace into the upgrade banner
export const getAiChatQuotaExhaustedKind = (
  error: unknown,
): 'limit' | 'allowance' | null => {
  if (!isGraphqlErrorOfType(error, AiChatErrorCode.QUOTA_EXHAUSTED)) {
    return null;
  }

  return getGraphqlErrorExtensionsFromError(error)?.exhaustedKind ===
    'allowance'
    ? 'allowance'
    : 'limit';
};
