export type ReplyMessagingType =
  | { messaging_type: 'RESPONSE' }
  | { messaging_type: 'MESSAGE_TAG'; tag: 'HUMAN_AGENT' };
