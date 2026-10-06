import { isFunction } from '@sniptt/guards';

import { type WorkerEventConstructor } from '@/polyfills/events/types/WorkerEventConstructor';

export const isWorkerEventConstructor = (
  value: unknown,
): value is WorkerEventConstructor => isFunction(value);
