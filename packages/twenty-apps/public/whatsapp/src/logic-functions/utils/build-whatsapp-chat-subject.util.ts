import { isNonEmptyString } from '@sniptt/guards';

import { getWhatsappChatCounterparts } from 'src/logic-functions/utils/get-whatsapp-chat-counterparts.util';
import { getWhatsappUserName } from 'src/logic-functions/utils/get-whatsapp-user-name.util';
import { isWhatsappGroupChat } from 'src/logic-functions/utils/is-whatsapp-group-chat.util';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

const NAMED_PARTICIPANT_COUNT = 2;

export const buildWhatsappChatSubject = (
  chat: UnipileChat,
): string | undefined => {
  const counterpartNames = getWhatsappChatCounterparts(chat)
    .map(getWhatsappUserName)
    .filter(isNonEmptyString);

  if (!isWhatsappGroupChat(chat)) {
    return counterpartNames[0] ?? (chat.name?.trim() || undefined);
  }

  if (isNonEmptyString(chat.name?.trim())) {
    return chat.name.trim();
  }

  if (counterpartNames.length === 0) {
    return undefined;
  }

  const namedParticipants = counterpartNames
    .slice(0, NAMED_PARTICIPANT_COUNT)
    .join(', ');
  const otherParticipantCount =
    counterpartNames.length - NAMED_PARTICIPANT_COUNT;

  return otherParticipantCount > 0
    ? `${namedParticipants} +${otherParticipantCount}`
    : namedParticipants;
};
