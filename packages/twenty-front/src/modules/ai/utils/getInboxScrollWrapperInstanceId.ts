import { type InboxSurface } from '@/ai/types/InboxSurface';

export const getInboxScrollWrapperInstanceId = (surface: InboxSurface) =>
  `ai-chat-scroll-wrapper-${surface}`;
