import { type WorkerMediaQueryListEvent } from '@/polyfills/media-query/types/WorkerMediaQueryListEvent';

type CreateWorkerMediaQueryListEventInput = {
  media: string;
  matches: boolean;
};

export const createWorkerMediaQueryListEvent = ({
  media,
  matches,
}: CreateWorkerMediaQueryListEventInput): WorkerMediaQueryListEvent => {
  const changeEvent = new Event('change') as WorkerMediaQueryListEvent;

  Object.defineProperty(changeEvent, 'media', { value: media });
  Object.defineProperty(changeEvent, 'matches', { value: matches });

  return changeEvent;
};
