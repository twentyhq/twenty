import { type AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';

export type AiChatThreadFilterDropdownPage =
  (typeof AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE)[keyof typeof AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE];
