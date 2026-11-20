import { AI_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai-chat/constants/AiChatRefetchMessagesEventName';
import { type AiChatThreadEventDetail } from '@/ai-chat/types/AiChatThreadEventDetail';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';

export const dispatchAiChatRefetchMessagesEvent = (threadId: string) =>
  dispatchBrowserEvent<AiChatThreadEventDetail>(
    AI_CHAT_REFETCH_MESSAGES_EVENT_NAME,
    { threadId },
  );
