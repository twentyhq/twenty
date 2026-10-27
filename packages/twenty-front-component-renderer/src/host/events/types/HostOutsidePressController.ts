import { type PushOutsidePressEvent } from '@/host/events/types/PushOutsidePressEvent';

export type HostOutsidePressController = {
  observeOutsidePresses: () => void;
  unobserveOutsidePresses: () => void;
  setPushOutsidePressEvent: (
    pushOutsidePressEvent: PushOutsidePressEvent | null,
  ) => void;
  reset: () => void;
};
