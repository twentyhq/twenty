import { type WorkerMediaQueryListEvent } from '@/polyfills/media-query/types/WorkerMediaQueryListEvent';
import { createEventWithReadonlyProperties } from '@/polyfills/utils/createEventWithReadonlyProperties';

type CreateWorkerMediaQueryListEventInput = {
  media: string;
  matches: boolean;
};

export const createWorkerMediaQueryListEvent = ({
  media,
  matches,
}: CreateWorkerMediaQueryListEventInput): WorkerMediaQueryListEvent =>
  createEventWithReadonlyProperties('change', { media, matches });
