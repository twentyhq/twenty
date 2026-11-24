import { getWhatsappChatCounterparts } from 'src/logic-functions/utils/get-whatsapp-chat-counterparts.util';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export const isWhatsappGroupChat = (chat: UnipileChat): boolean =>
  chat.is_group || getWhatsappChatCounterparts(chat).length > 1;
