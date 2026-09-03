import { isDefined } from 'twenty-shared/utils';

// The worker takes tens of seconds to activate on CI, because its script
// request queues behind the story module transforms. serviceWorker.ready is
// used rather than getRegistration() because msw registers the worker
// asynchronously while ./preview evaluates, so the registration may not exist
// yet when this runs. The backstop covers a worker that never activates.
const SERVICE_WORKER_CONTROL_BACKSTOP_MS = 60_000;

export const waitForServiceWorkerToControlPage = async () => {
  if (isDefined(navigator.serviceWorker.controller)) {
    return;
  }

  const backstop = new Promise<void>((resolve) => {
    setTimeout(resolve, SERVICE_WORKER_CONTROL_BACKSTOP_MS);
  });

  await Promise.race([
    navigator.serviceWorker.ready.then(() => undefined),
    backstop,
  ]);

  if (isDefined(navigator.serviceWorker.controller)) {
    return;
  }

  await Promise.race([
    new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => resolve(),
        { once: true },
      );
    }),
    backstop,
  ]);
};
