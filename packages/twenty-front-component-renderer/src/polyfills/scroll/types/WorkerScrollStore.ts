import { type EventScrollExtent } from '@/polyfills/scroll/types/EventScrollExtent';
import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollRequest } from '@/types/ScrollRequest';
import { type SerializedEventData } from '@/types/SerializedEventData';

export type WorkerScrollStore = {
  setRootElement: (rootElement: object) => void;
  readScrollOffset: (input: { element: object; axis: ScrollAxis }) => number;
  readEventScrollExtent: (input: {
    element: object;
    extent: EventScrollExtent;
  }) => number | undefined;
  requestScroll: (input: { element: object; request: ScrollRequest }) => void;
  observeEventTarget: (input: {
    element: object;
    eventData: SerializedEventData;
  }) => void;
  scheduleDetachedElementSweep: () => void;
};
