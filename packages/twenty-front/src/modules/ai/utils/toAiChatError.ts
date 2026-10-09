import { type AiChatError } from '@/ai/types/AiChatError';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

export const toAiChatError = (error: unknown): AiChatError =>
  CombinedGraphQLErrors.is(error) || error instanceof Error
    ? error
    : new Error('An unexpected error occurred');
