import {
  type LineMessageEvent,
  type LineWebhookEvent,
} from 'src/logic-functions/types/line-webhook.type';

export type LineHandledEvent = LineMessageEvent & {
  source: { type: 'user'; userId: string };
};

// group and room chats are not imported yet
export const isHandledLineEvent = (
  event: LineWebhookEvent,
): event is LineHandledEvent =>
  event.source.type === 'user' && event.type === 'message';
