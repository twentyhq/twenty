import { isDefined } from 'twenty-sdk/utils';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export const getLinkedinChatCounterparts = (
  chat: UnipileChat,
): UnipileUser[] => {
  if (isDefined(chat.user)) {
    return [chat.user];
  }

  return (chat.participants ?? [])
    .filter((participant) => !participant.is_self)
    .map((participant) => participant.user);
};
