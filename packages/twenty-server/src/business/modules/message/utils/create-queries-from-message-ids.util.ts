import { MessageQuery } from 'src/business/modules/message/types/message-or-thread-query';

export const createQueriesFromMessageIds = (
  messageExternalIds: string[],
): MessageQuery[] => {
  return messageExternalIds.map((messageId) => ({
    uri: '/gmail/v1/users/me/messages/' + messageId + '?format=RAW',
  }));
};
