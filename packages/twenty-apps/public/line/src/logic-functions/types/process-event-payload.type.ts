import { type LineHandledEvent } from 'src/logic-functions/data/is-handled-line-event.util';

export type ProcessEventPayload = {
  botUserId: string;
  event: LineHandledEvent;
};
