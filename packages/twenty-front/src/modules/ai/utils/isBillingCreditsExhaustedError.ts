import { AIChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { isAIChatErrorOfType } from '@/ai/utils/isAIChatErrorOfType';

export const isBillingCreditsExhaustedError = (
  error: Error | null | undefined,
): boolean => {
  return isAIChatErrorOfType(error, AIChatErrorCode.BILLING_CREDITS_EXHAUSTED);
};
