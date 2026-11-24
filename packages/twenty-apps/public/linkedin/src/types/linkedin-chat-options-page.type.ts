import { type LinkedinChatOption } from 'src/types/linkedin-chat-option.type';

export type LinkedinChatOptionsPage = {
  chats: LinkedinChatOption[];
  hasMore: boolean;
};
