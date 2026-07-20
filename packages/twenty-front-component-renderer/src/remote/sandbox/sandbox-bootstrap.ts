import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { type FrontComponentSandboxMessage } from '@/remote/sandbox/types/FrontComponentSandboxMessage';
import { createSandboxErrorMessageFromWorkerErrorEvent } from '@/remote/sandbox/utils/createSandboxErrorMessageFromWorkerErrorEvent';
import { createWorkerSpawnErrorSandboxMessage } from '@/remote/sandbox/utils/createWorkerSpawnErrorSandboxMessage';
import { parseFrontComponentSandboxMessage } from '@/remote/sandbox/utils/parseFrontComponentSandboxMessage';
import { createFrontComponentRemoteWorker } from '@/remote/worker/utils/createFrontComponentRemoteWorker';

let worker: Worker | null = null;

const postSandboxMessageToHostWindow = (
  message: FrontComponentSandboxMessage,
): void => {
  window.parent.postMessage(message, '*');
};

window.addEventListener('message', (event) => {
  const sandboxMessage = parseFrontComponentSandboxMessage(event.data);

  if (
    isDefined(worker) ||
    sandboxMessage?.type !== FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.INIT
  ) {
    return;
  }

  const [hostPort] = event.ports;

  if (!isDefined(hostPort)) {
    return;
  }

  let spawnedWorker: Worker;

  try {
    spawnedWorker = createFrontComponentRemoteWorker();
  } catch (error) {
    postSandboxMessageToHostWindow(createWorkerSpawnErrorSandboxMessage(error));

    return;
  }

  worker = spawnedWorker;

  spawnedWorker.addEventListener('error', (errorEvent) => {
    postSandboxMessageToHostWindow(
      createSandboxErrorMessageFromWorkerErrorEvent(errorEvent),
    );
  });

  spawnedWorker.postMessage(
    {
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.INIT,
    } satisfies FrontComponentSandboxMessage,
    [hostPort],
  );
});

postSandboxMessageToHostWindow({
  type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY,
});
