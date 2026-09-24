import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { QUEUE_JOB_BROWSER_EVENT_NAME } from '@/queue-job/constants/QueueJobBrowserEventName';
import { type JobStatus } from '~/generated-metadata/graphql';

export const dispatchQueueJobEventsFromSseToBrowserEvents = (
  queueJobEvents: JobStatus[],
) => {
  for (const queueJobEvent of queueJobEvents) {
    dispatchBrowserEvent(QUEUE_JOB_BROWSER_EVENT_NAME, queueJobEvent);
  }
};
