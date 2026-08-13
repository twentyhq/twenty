import { type WorkerMediaQueryListener } from '@/polyfills/media-query/types/WorkerMediaQueryListener';

export type WorkerMediaQueryList = {
  readonly matches: boolean;
  readonly media: string;
  onchange: WorkerMediaQueryListener | null;
  addEventListener: (type: string, listener: WorkerMediaQueryListener) => void;
  removeEventListener: (
    type: string,
    listener: WorkerMediaQueryListener,
  ) => void;
  addListener: (listener: WorkerMediaQueryListener) => void;
  removeListener: (listener: WorkerMediaQueryListener) => void;
};
