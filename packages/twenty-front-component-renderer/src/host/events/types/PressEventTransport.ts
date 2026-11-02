import { type PushOutsidePressEvent } from '@/host/events/types/PushOutsidePressEvent';
import { type PushOwnedPressEvent } from '@/host/events/types/PushOwnedPressEvent';

export type PressEventTransport = {
  pushOutsidePressEvent: PushOutsidePressEvent;
  pushOwnedPressEvent: PushOwnedPressEvent;
};
