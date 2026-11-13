import { type INBOX_SURFACE } from '@/ai/constants/InboxSurface';

export type InboxSurface = (typeof INBOX_SURFACE)[keyof typeof INBOX_SURFACE];
