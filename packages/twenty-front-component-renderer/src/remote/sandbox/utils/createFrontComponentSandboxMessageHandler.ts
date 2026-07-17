import { isNonEmptyString } from '@sniptt/guards';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { type FrontComponentSandboxMessage } from '@/remote/sandbox/types/FrontComponentSandboxMessage';
import { parseFrontComponentSandboxMessage } from '@/remote/sandbox/utils/parseFrontComponentSandboxMessage';

const UNKNOWN_WORKER_ERROR_MESSAGE = 'Unknown front component worker error';

type FrontComponentSandboxMessageHandlerConfig = {
  sandboxIframe: HTMLIFrameElement;
  workerMessagePort: MessagePort;
  onSandboxError: (error: Error) => void;
};

export const createFrontComponentSandboxMessageHandler = ({
  sandboxIframe,
  workerMessagePort,
  onSandboxError,
}: FrontComponentSandboxMessageHandlerConfig): ((
  event: MessageEvent,
) => void) => {
  let hasTransferredWorkerPort = false;

  return (event: MessageEvent) => {
    if (event.source !== sandboxIframe.contentWindow) {
      return;
    }

    const sandboxMessage = parseFrontComponentSandboxMessage(event.data);

    if (!isDefined(sandboxMessage)) {
      return;
    }

    if (sandboxMessage.type === FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY) {
      if (hasTransferredWorkerPort) {
        return;
      }
      hasTransferredWorkerPort = true;

      sandboxIframe.contentWindow?.postMessage(
        {
          type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.INIT,
        } satisfies FrontComponentSandboxMessage,
        '*',
        [workerMessagePort],
      );

      return;
    }

    if (sandboxMessage.type === FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR) {
      onSandboxError(
        new CustomError(
          isNonEmptyString(sandboxMessage.message)
            ? sandboxMessage.message
            : UNKNOWN_WORKER_ERROR_MESSAGE,
          'FRONT_COMPONENT_WORKER_ERROR',
        ),
      );
    }
  };
};
