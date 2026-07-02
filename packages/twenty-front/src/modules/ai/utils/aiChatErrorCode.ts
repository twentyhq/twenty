// Error codes matching backend AgentExceptionCode and BillingExceptionCode
export const AiChatErrorCode = {
  BILLING_CREDITS_EXHAUSTED: 'BILLING_CREDITS_EXHAUSTED',
  CONTEXT_WINDOW_EXCEEDED: 'CONTEXT_WINDOW_EXCEEDED',
  API_KEY_NOT_CONFIGURED: 'API_KEY_NOT_CONFIGURED',
} as const;
