import { type WorkerEventConstructor } from '@/polyfills/events/types/WorkerEventConstructor';
import { isWorkerEventConstructor } from '@/polyfills/events/utils/isWorkerEventConstructor';

export const resolveBaseEventClass = (
  eventClassScope: Record<string, unknown>,
): WorkerEventConstructor => {
  const baseEventClass = eventClassScope.Event;

  return isWorkerEventConstructor(baseEventClass) ? baseEventClass : Event;
};
