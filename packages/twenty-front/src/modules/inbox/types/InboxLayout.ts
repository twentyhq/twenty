import { type INBOX_LAYOUT } from '@/inbox/constants/InboxLayout';

export type InboxLayout = (typeof INBOX_LAYOUT)[keyof typeof INBOX_LAYOUT];
