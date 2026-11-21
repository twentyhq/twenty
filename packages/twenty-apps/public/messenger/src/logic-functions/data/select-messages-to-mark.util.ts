import {
  MESSENGER_MESSAGE_STATUSES,
  type MessengerMessageStatus,
} from 'src/constants/messenger-message-statuses.constant';

export type OutgoingMessage = {
  id: string;
  externalId: string | null;
  receivedAt: string | null;
  messengerStatus: string | null;
};

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
      (message.externalId !== null && mids.includes(message.externalId)) ||
      (message.receivedAt !== null &&
        new Date(message.receivedAt).getTime() <= watermark);

    return (
      isCovered &&
      getStatusRank(message.messengerStatus) < getStatusRank(status)
    );
  });
