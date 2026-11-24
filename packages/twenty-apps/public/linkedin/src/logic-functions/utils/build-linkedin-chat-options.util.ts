import { isDefined } from 'twenty-sdk/utils';

import { buildLinkedinChatOption } from 'src/logic-functions/utils/build-linkedin-chat-option.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { isLinkedinGroupChat } from 'src/logic-functions/utils/is-linkedin-group-chat.util';
import { type LinkedinChatOption } from 'src/types/linkedin-chat-option.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

const getChatOptionKey = (chat: UnipileChat): string => {
  const counterpartId = isLinkedinGroupChat(chat)
    ? undefined
    : (getLinkedinChatCounterparts(chat)[0]?.id ?? chat.user_id);

  return isDefined(counterpartId)
    ? `counterpart:${counterpartId}`
    : `chat:${chat.id}`;
};

export const buildLinkedinChatOptions = (
  chats: UnipileChat[],
): LinkedinChatOption[] => {
  const optionByKey = new Map<string, LinkedinChatOption>();

  for (const chat of chats) {
    const key = getChatOptionKey(chat);
    const option = optionByKey.get(key);

    if (isDefined(option)) {
      option.chatIds.push(chat.id);
    } else {
      optionByKey.set(key, buildLinkedinChatOption(chat));
    }
  }

  return [...optionByKey.values()];
};
