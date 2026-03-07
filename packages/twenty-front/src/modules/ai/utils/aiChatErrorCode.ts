// Error codes matching backend AgentExceptionCode and BillingExceptionCode
export const AIChatErrorCode = {
  BILLING_CREDITS_EXHAUSTED: 'BILLING_CREDITS_EXHAUSTED',
  API_KEY_NOT_CONFIGURED: 'API_KEY_NOT_CONFIGURED',
} as const;

export type AIChatErrorCodeType =
  (typeof AIChatErrorCode)[keyof typeof AIChatErrorCode];
