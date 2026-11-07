import { type HostEventDispatchFields } from '@/host/events/types/HostEventDispatchFields';
import { type PressEventTransport } from '@/host/events/types/PressEventTransport';

export type HostOutsidePressController = {
  observeOutsidePresses: () => void;
  unobserveOutsidePresses: () => void;
  setPressEventTransport: (pressEventTransport: PressEventTransport) => void;
  forwardUnhandledOwnedPress: (hostEvent: HostEventDispatchFields) => void;
  reset: () => void;
};
