import { type AiChatError } from '@/ai/types/AiChatError';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';

export const toAiChatError = (error: unknown): AiChatError =>
  CombinedGraphQLErrors.is(error) || error instanceof Error
    ? error
    : new Error(t`An unexpected error occurred`);
