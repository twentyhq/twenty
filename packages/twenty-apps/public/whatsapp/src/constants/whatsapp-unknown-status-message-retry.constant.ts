// a status can arrive before the send that caused it has stored its message
export const WHATSAPP_UNKNOWN_STATUS_MESSAGE_RETRY = {
  maxAttempts: 5,
  delayMs: 3_000,
} as const;
