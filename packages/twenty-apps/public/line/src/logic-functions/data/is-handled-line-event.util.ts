import {
  type LineMessageEvent,
  type LineUnsendEvent,
  type LineWebhookEvent,
} from 'src/logic-functions/types/line-webhook.type';

type OneOnOneSource = { source: { type: 'user'; userId: string } };

export type LineHandledEvent =
  | (LineMessageEvent & OneOnOneSource)
  | (LineUnsendEvent & OneOnOneSource);

// group and room chats are not imported yet
export const isHandledLineEvent = (
  event: LineWebhookEvent,
): event is LineHandledEvent =>
  event.source.type === 'user' &&
  (event.type === 'message' || event.type === 'unsend');
