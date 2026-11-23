import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { buildWhatsappChatSubject } from 'src/logic-functions/utils/build-whatsapp-chat-subject.util';
import { getWhatsappChatCounterparts } from 'src/logic-functions/utils/get-whatsapp-chat-counterparts.util';
import { getWhatsappPhoneHandle } from 'src/logic-functions/utils/get-whatsapp-phone-handle.util';
import { isWhatsappGroupChat } from 'src/logic-functions/utils/is-whatsapp-group-chat.util';
import { type WhatsappChatOption } from 'src/types/whatsapp-chat-option.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export const buildWhatsappChatOption = (
  chat: UnipileChat,
): WhatsappChatOption => {
  const subject = buildWhatsappChatSubject(chat);
  const [counterpart] = getWhatsappChatCounterparts(chat);

  const phoneHandle = isDefined(counterpart)
    ? getWhatsappPhoneHandle(counterpart)
    : undefined;

  return {
    id: chat.id,
    name: isNonEmptyString(subject) ? subject : (phoneHandle ?? chat.id),
    isGroup: isWhatsappGroupChat(chat),
    lastMessageAt: chat.last_message_timestamp,
  };
};
