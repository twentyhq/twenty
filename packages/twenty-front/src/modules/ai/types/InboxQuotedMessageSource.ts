export type InboxQuotedMessageSource =
  | { status: 'available'; authorName: string; excerpt: string }
  | { status: 'unavailable' };
