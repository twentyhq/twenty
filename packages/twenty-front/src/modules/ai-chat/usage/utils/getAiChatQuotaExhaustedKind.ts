import { AiChatErrorCode } from '@/ai-chat/utils/aiChatErrorCode';
import { getGraphqlErrorExtensionsFromError } from '~/utils/get-graphql-error-extensions-from-error.util';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const getAiChatQuotaExhaustedKind = (
  error: unknown,
): 'limit' | 'workspaceAllowance' | 'userAllowance' | null => {
  if (!isGraphqlErrorOfType(error, AiChatErrorCode.QUOTA_EXHAUSTED)) {
    return null;
  }

  const exhaustedKind =
    getGraphqlErrorExtensionsFromError(error)?.exhaustedKind;

  return exhaustedKind === 'workspaceAllowance' ||
    exhaustedKind === 'userAllowance'
    ? exhaustedKind
    : 'limit';
};
