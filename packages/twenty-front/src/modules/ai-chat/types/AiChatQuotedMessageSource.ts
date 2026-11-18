export type AiChatQuotedMessageSource =
  | { status: 'available'; authorName: string; excerpt: string }
  | { status: 'unavailable' };
