import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { type FrontComponentSandboxMessage } from '@/remote/sandbox/types/FrontComponentSandboxMessage';

const WORKER_SPAWN_FAILURE_MESSAGE =
  'Failed to spawn the front component worker';

export const createWorkerSpawnErrorSandboxMessage = (
  error: unknown,
): FrontComponentSandboxMessage => ({
  type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
  message:
    error instanceof Error ? error.message : WORKER_SPAWN_FAILURE_MESSAGE,
});
