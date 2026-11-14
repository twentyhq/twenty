import { isDefined } from 'twenty-sdk/utils';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export const getLinkedinChatReadState = (
  chat: Pick<UnipileChat, 'unread_count'>,
): boolean | undefined =>
  isDefined(chat.unread_count) ? chat.unread_count === 0 : undefined;
