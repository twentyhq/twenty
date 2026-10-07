import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const isAiChatIncludedChatPausedError = (error: unknown): boolean =>
  isGraphqlErrorOfType(error, AiChatErrorCode.INCLUDED_CHAT_PAUSED);
