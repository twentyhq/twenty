import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export const isLinkedinGroupChat = (chat: UnipileChat): boolean =>
  chat.is_group || getLinkedinChatCounterparts(chat).length > 1;
