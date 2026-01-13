import { atom, selector } from 'recoil';

import { AgentType, ChatMessage, ChatSession } from '../types/chat.types';

export const chatMessagesState = atom<ChatMessage[]>({
  key: 'ai-chat/chatMessagesState',
  default: [],
});

export const activeChatSessionState = atom<ChatSession | null>({
  key: 'ai-chat/activeChatSessionState',
  default: null,
});

export const activeAgentState = atom<AgentType>({
  key: 'ai-chat/activeAgentState',
  default: 'orchestrator',
});

export const chatLoadingState = atom<boolean>({
  key: 'ai-chat/chatLoadingState',
  default: false,
});

export const chatErrorState = atom<string | null>({
  key: 'ai-chat/chatErrorState',
  default: null,
});

export const chatWidgetOpenState = atom<boolean>({
  key: 'ai-chat/chatWidgetOpenState',
  default: false,
});

export const linkedEntityState = atom<{
  type: 'company' | 'contact' | 'document';
  id: string;
  name: string;
} | null>({
  key: 'ai-chat/linkedEntityState',
  default: null,
});

// Selectors
export const lastMessageSelector = selector({
  key: 'ai-chat/lastMessageSelector',
  get: ({ get }) => {
    const messages = get(chatMessagesState);
    return messages[messages.length - 1] || null;
  },
});

export const messageCountSelector = selector({
  key: 'ai-chat/messageCountSelector',
  get: ({ get }) => {
    const messages = get(chatMessagesState);
    return messages.length;
  },
});
