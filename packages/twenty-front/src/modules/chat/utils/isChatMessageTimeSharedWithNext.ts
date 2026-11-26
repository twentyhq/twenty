import { isDefined } from 'twenty-shared/utils';

import { CHAT_MESSAGE_TIME_SHARING_WINDOW_IN_MS } from '@/chat/constants/ChatMessageTimeSharingWindowInMs';

export const isChatMessageTimeSharedWithNext = ({
  sentAt,
  nextSentAt,
}: {
  sentAt: Date | string | null | undefined;
  nextSentAt: Date | string | null | undefined;
}): boolean => {
  if (!isDefined(sentAt) || !isDefined(nextSentAt)) {
    return false;
  }

  return (
    new Date(nextSentAt).getTime() - new Date(sentAt).getTime() <
    CHAT_MESSAGE_TIME_SHARING_WINDOW_IN_MS
  );
};
