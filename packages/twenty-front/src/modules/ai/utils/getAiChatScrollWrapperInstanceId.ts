import { type InboxSurface } from '@/ai/types/AiChatSurface';

export const getInboxScrollWrapperInstanceId = (surface: InboxSurface) =>
  `ai-chat-scroll-wrapper-${surface}`;
