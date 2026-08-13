import { type WorkerMediaQueryListEvent } from '@/polyfills/media-query/types/WorkerMediaQueryListEvent';

export type WorkerMediaQueryListener = (
  event: WorkerMediaQueryListEvent,
) => void;
