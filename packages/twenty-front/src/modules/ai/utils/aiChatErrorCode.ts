// Error codes matching backend AgentExceptionCode and BillingExceptionCode,
// plus client-only codes (CONNECTION_LOST never leaves the browser).
export const AiChatErrorCode = {
  BILLING_CREDITS_EXHAUSTED: 'BILLING_CREDITS_EXHAUSTED',
  API_KEY_NOT_CONFIGURED: 'API_KEY_NOT_CONFIGURED',
  CONNECTION_LOST: 'CONNECTION_LOST',
} as const;
