import { type LineSource } from 'src/logic-functions/types/line-webhook.type';

// the id a push message is addressed to, so it also identifies the thread
export const getLineChatId = (source: LineSource): string => {
  switch (source.type) {
    case 'user':
      return source.userId;
    case 'group':
      return source.groupId;
    case 'room':
      return source.roomId;
  }
};
