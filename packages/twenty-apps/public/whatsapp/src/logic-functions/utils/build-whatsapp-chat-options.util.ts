import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { buildWhatsappChatSubject } from 'src/logic-functions/utils/build-whatsapp-chat-subject.util';
import { getWhatsappChatCounterparts } from 'src/logic-functions/utils/get-whatsapp-chat-counterparts.util';
import { getWhatsappPhoneHandle } from 'src/logic-functions/utils/get-whatsapp-phone-handle.util';
import { isWhatsappGroupChat } from 'src/logic-functions/utils/is-whatsapp-group-chat.util';
import { type WhatsappChatOption } from 'src/types/whatsapp-chat-option.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

const getCounterpartPhoneHandle = (chat: UnipileChat): string | undefined => {
  const [counterpart] = getWhatsappChatCounterparts(chat);

  return isDefined(counterpart) && !isWhatsappGroupChat(chat)
    ? getWhatsappPhoneHandle(counterpart)
    : undefined;
};

// Expects the chats most recent first: an option keeps the name and date of its latest chat
export const buildWhatsappChatOptions = (
  chats: UnipileChat[],
): WhatsappChatOption[] => {
  const optionByKey = new Map<string, WhatsappChatOption>();

  for (const chat of chats) {
    const phoneHandle = getCounterpartPhoneHandle(chat);
    const key = phoneHandle ?? chat.id;
    const option = optionByKey.get(key);

    if (isDefined(option)) {
      option.chatIds.push(chat.id);

      continue;
    }

    const subject = buildWhatsappChatSubject(chat);

    optionByKey.set(key, {
      id: chat.id,
      chatIds: [chat.id],
      name: isNonEmptyString(subject) ? subject : (phoneHandle ?? chat.id),
      isGroup: isWhatsappGroupChat(chat),
      lastMessageAt: chat.last_message_timestamp,
    });
  }

  return [...optionByKey.values()];
};
