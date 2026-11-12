import { type WorkerMediaQueryListener } from '@/polyfills/media-query/types/WorkerMediaQueryListener';

export type WorkerMediaQueryList = EventTarget & {
  readonly matches: boolean;
  readonly media: string;
  onchange: WorkerMediaQueryListener | null;
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean | null,
  ) => void;
  addListener: (listener: WorkerMediaQueryListener | null) => void;
  removeListener: (listener: WorkerMediaQueryListener | null) => void;
};
