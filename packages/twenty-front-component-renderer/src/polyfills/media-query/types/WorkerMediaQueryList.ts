import { type WorkerMediaQueryListener } from '@/polyfills/media-query/types/WorkerMediaQueryListener';

export type WorkerMediaQueryList = EventTarget & {
  readonly matches: boolean;
  readonly media: string;
  onchange: WorkerMediaQueryListener | null;
  addListener: (listener: WorkerMediaQueryListener) => void;
  removeListener: (listener: WorkerMediaQueryListener) => void;
};
