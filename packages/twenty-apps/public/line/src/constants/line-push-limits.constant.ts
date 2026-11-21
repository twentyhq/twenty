// https://developers.line.biz/en/reference/messaging-api/#send-push-message
export const LINE_PUSH_LIMITS = {
  // counted in UTF-16 code units, which is what String.length measures
  textMaxLength: 5000,
  messagesPerRequest: 5,
} as const;
