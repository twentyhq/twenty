import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_MESSAGE_STATUSES } from 'src/constants/messenger-message-statuses.constant';
import { type MessengerMessageStatus } from 'src/logic-functions/types/messenger-message-status.type';
import { type OutgoingMessage } from 'src/logic-functions/types/outgoing-message.type';

const getStatusRank = (status: string | null) =>
  MESSENGER_MESSAGE_STATUSES.findIndex((candidate) => candidate === status);

// a receipt covers the listed mids, and every message sent at or before its watermark
export const selectMessagesToMark = ({
  messages,
  status,
  watermark,
  mids = [],
}: {
  messages: OutgoingMessage[];
  status: MessengerMessageStatus;
  watermark: number;
  mids?: string[];
}): OutgoingMessage[] =>
  messages.filter((message) => {
    const isCovered =
      (isDefined(message.externalId) && mids.includes(message.externalId)) ||
      (isDefined(message.receivedAt) &&
        new Date(message.receivedAt).getTime() <= watermark);

    return (
      isCovered &&
      getStatusRank(message.messengerStatus) < getStatusRank(status)
    );
  });
