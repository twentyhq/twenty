import { isNonEmptyString } from '@sniptt/guards';

import { buildLinkedinChatSubject } from 'src/logic-functions/utils/build-linkedin-chat-subject.util';
import { isLinkedinGroupChat } from 'src/logic-functions/utils/is-linkedin-group-chat.util';
import { type LinkedinChatOption } from 'src/types/linkedin-chat-option.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export const buildLinkedinChatOption = (
  chat: UnipileChat,
): LinkedinChatOption => {
  const subject = buildLinkedinChatSubject(chat);

  return {
    id: chat.id,
    name: isNonEmptyString(subject) ? subject : chat.id,
    isGroup: isLinkedinGroupChat(chat),
    lastMessageAt: chat.last_message_timestamp,
  };
};
