import { isNonEmptyString } from '@sniptt/guards';

import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { isLinkedinGroupChat } from 'src/logic-functions/utils/is-linkedin-group-chat.util';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

const NAMED_PARTICIPANT_COUNT = 2;

export const buildLinkedinChatSubject = (
  chat: UnipileChat,
): string | undefined => {
  const counterpartNames = getLinkedinChatCounterparts(chat)
    .map((counterpart) => counterpart.display_name?.trim())
    .filter(isNonEmptyString);

  if (!isLinkedinGroupChat(chat)) {
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
