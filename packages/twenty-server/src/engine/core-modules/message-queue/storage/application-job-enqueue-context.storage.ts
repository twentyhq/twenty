import { AsyncLocalStorage } from 'async_hooks';

// Attribution for a job enqueued on behalf of an application. Enqueues to
// guarded queues must run within this context so the enqueue guard can throttle
// per application and per application registration.
export type ApplicationJobEnqueueContext = {
  applicationId: string;
  applicationRegistrationId: string;
};

export const applicationJobEnqueueContextStorage =
  new AsyncLocalStorage<ApplicationJobEnqueueContext>();

export const withApplicationJobEnqueueContext = <T>(
  context: ApplicationJobEnqueueContext,
  fn: () => T | Promise<T>,
): T | Promise<T> => {
  return applicationJobEnqueueContextStorage.run(context, fn);
};
