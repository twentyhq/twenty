import { isNonEmptyString } from '@sniptt/guards';

import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { type FrontComponentSandboxMessage } from '@/remote/sandbox/types/FrontComponentSandboxMessage';
import { buildClonableErrorPayload } from '@/utils/buildClonableErrorPayload';
import { isErrorLikeValue } from '@/utils/isErrorLikeValue';

const WORKER_SPAWN_FAILURE_MESSAGE =
  'Failed to spawn the front component worker';

export const createWorkerSpawnErrorSandboxMessage = (
  error: unknown,
): FrontComponentSandboxMessage => {
  const { name, message } = buildClonableErrorPayload(error);

  const isInformativeMessage = isNonEmptyString(message) && message !== name;

  return {
    type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
    message:
      isErrorLikeValue(error) && isInformativeMessage
        ? message
        : WORKER_SPAWN_FAILURE_MESSAGE,
  };
};
