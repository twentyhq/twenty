import { type MESSENGER_MESSAGE_STATUSES } from 'src/constants/messenger-message-statuses.constant';

export type MessengerMessageStatus =
  (typeof MESSENGER_MESSAGE_STATUSES)[number];
