import { AI_CHAT_USER_MESSAGE_LONG_TEXT_MIN_LENGTH } from '@/ai/constants/AiChatUserMessageLongTextMinLength';

export const isAiChatUserMessageLong = (text: string) =>
  text.length >= AI_CHAT_USER_MESSAGE_LONG_TEXT_MIN_LENGTH;
