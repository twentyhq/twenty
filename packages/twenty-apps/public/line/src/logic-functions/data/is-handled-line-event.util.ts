import {
  type LineMessage,
  type LineMessageEditedEvent,
  type LineMessageEvent,
  type LineUnsendEvent,
  type LineWebhookEvent,
} from 'src/logic-functions/types/line-webhook.type';

export type LineHandledEvent =
  | LineMessageEvent
  | LineUnsendEvent
  | LineMessageEditedEvent;

const IMPORTED_MESSAGE_TYPES: LineMessage['type'][] = [
  'text',
  'image',
  'video',
  'audio',
  'file',
  'location',
  'sticker',
];

// LINE may add message types the app cannot render, and only text can be edited
export const isHandledLineEvent = (
  event: LineWebhookEvent,
): event is LineHandledEvent => {
  switch (event.type) {
    case 'message':
      return IMPORTED_MESSAGE_TYPES.includes(event.message.type);
    case 'messageEdited':
      return event.message.type === 'text';
    case 'unsend':
      return true;
    default:
      return false;
  }
};
