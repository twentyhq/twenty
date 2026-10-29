import { isNonEmptyString } from '@sniptt/guards';

import { AI_CHAT_USER_MESSAGE_LONG_TEXT_MIN_LENGTH } from '@/ai/constants/AiChatUserMessageLongTextMinLength';
import { AI_CHAT_USER_MESSAGE_LONG_TEXT_MIN_LINE_COUNT } from '@/ai/constants/AiChatUserMessageLongTextMinLineCount';

export const isAiChatUserMessageLong = (text: string) =>
  text.length >= AI_CHAT_USER_MESSAGE_LONG_TEXT_MIN_LENGTH ||
  text.split('\n').filter((line) => isNonEmptyString(line.trim())).length >=
    AI_CHAT_USER_MESSAGE_LONG_TEXT_MIN_LINE_COUNT;
