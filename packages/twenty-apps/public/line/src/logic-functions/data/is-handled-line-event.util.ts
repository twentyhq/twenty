import {
  type LineMessage,
  type LineMessageEvent,
  type LineUnsendEvent,
  type LineWebhookEvent,
} from 'src/logic-functions/types/line-webhook.type';

type OneOnOneSource = { source: { type: 'user'; userId: string } };

export type LineHandledEvent =
  | (LineMessageEvent & OneOnOneSource)
  | (LineUnsendEvent & OneOnOneSource);

const IMPORTED_MESSAGE_TYPES: LineMessage['type'][] = [
  'text',
  'image',
  'video',
  'audio',
  'file',
  'location',
  'sticker',
];

// group and room chats are not imported yet, and LINE may add message types the app cannot render
export const isHandledLineEvent = (
  event: LineWebhookEvent,
): event is LineHandledEvent =>
  event.source.type === 'user' &&
  (event.type === 'unsend' ||
    (event.type === 'message' &&
      IMPORTED_MESSAGE_TYPES.includes(event.message.type)));
