import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_SANDBOX_MESSAGE } from '@/remote/sandbox/frontComponentSandboxMessages';
import { createRemoteWorker } from '@/remote/worker/utils/createRemoteWorker';

let worker: Worker | null = null;

window.addEventListener('message', (event) => {
  if (
    isDefined(worker) ||
    (event.data as { type?: string } | null)?.type !==
      FRONT_COMPONENT_SANDBOX_MESSAGE.INIT
  ) {
    return;
  }

  const [hostPort] = event.ports;

  if (!isDefined(hostPort)) {
    return;
  }

  let spawnedWorker: Worker;

  try {
    spawnedWorker = createRemoteWorker();
  } catch (error) {
    window.parent.postMessage(
      {
        type: FRONT_COMPONENT_SANDBOX_MESSAGE.ERROR,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to spawn the front component worker',
      },
      '*',
    );

    return;
  }

  worker = spawnedWorker;

  spawnedWorker.addEventListener('error', (errorEvent) => {
    window.parent.postMessage(
      {
        type: FRONT_COMPONENT_SANDBOX_MESSAGE.ERROR,
        message: errorEvent.message,
        filename: errorEvent.filename,
        lineno: errorEvent.lineno,
        colno: errorEvent.colno,
      },
      '*',
    );
  });

  spawnedWorker.postMessage({ type: FRONT_COMPONENT_SANDBOX_MESSAGE.INIT }, [
    hostPort,
  ]);
});

window.parent.postMessage({ type: FRONT_COMPONENT_SANDBOX_MESSAGE.READY }, '*');
