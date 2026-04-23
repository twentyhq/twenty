import { AIChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { isAIChatErrorOfType } from '@/ai/utils/isAIChatErrorOfType';

export const isApiKeyNotConfiguredError = (
  error: Error | null | undefined,
): boolean => {
  return isAIChatErrorOfType(error, AIChatErrorCode.API_KEY_NOT_CONFIGURED);
};
