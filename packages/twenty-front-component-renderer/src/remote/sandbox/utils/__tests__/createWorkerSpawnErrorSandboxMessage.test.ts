import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { createWorkerSpawnErrorSandboxMessage } from '../createWorkerSpawnErrorSandboxMessage';

describe('createWorkerSpawnErrorSandboxMessage', () => {
  it('should use the error message when a spawn Error is provided', () => {
    expect(
      createWorkerSpawnErrorSandboxMessage(new Error('worker blocked by CSP')),
    ).toEqual({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
      message: 'worker blocked by CSP',
    });
  });

  it('should fall back to the spawn failure message when the thrown value is not an Error', () => {
    expect(createWorkerSpawnErrorSandboxMessage('exploded')).toEqual({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
      message: 'Failed to spawn the front component worker',
    });
  });

  it('should fall back to the spawn failure message when the Error message is empty', () => {
    expect(createWorkerSpawnErrorSandboxMessage(new Error(''))).toEqual({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
      message: 'Failed to spawn the front component worker',
    });
  });
});
