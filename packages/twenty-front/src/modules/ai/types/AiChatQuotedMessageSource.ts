import { type ReactNode } from 'react';

export type AiChatQuotedMessageSource =
  | {
      status: 'available';
      messageId: string;
      authorName: string;
      authorAvatar?: ReactNode;
      excerpt: string;
    }
  | { status: 'unavailable' };
