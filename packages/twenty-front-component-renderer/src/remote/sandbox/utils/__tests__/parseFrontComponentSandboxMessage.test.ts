import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { parseFrontComponentSandboxMessage } from '../parseFrontComponentSandboxMessage';

describe('parseFrontComponentSandboxMessage', () => {
  it('should parse a READY message', () => {
    expect(
      parseFrontComponentSandboxMessage({
        type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY,
      }),
    ).toEqual({ type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY });
  });

  it('should parse an INIT message', () => {
    expect(
      parseFrontComponentSandboxMessage({
        type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.INIT,
      }),
    ).toEqual({ type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.INIT });
  });

  it('should parse an ERROR message with its details', () => {
    expect(
      parseFrontComponentSandboxMessage({
        type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
        message: 'worker exploded',
        filename: 'blob:worker.js',
        lineno: 12,
        colno: 3,
      }),
    ).toEqual({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
      message: 'worker exploded',
      filename: 'blob:worker.js',
      lineno: 12,
      colno: 3,
    });
  });

  it('should parse an ERROR message without a message text', () => {
    expect(
      parseFrontComponentSandboxMessage({
        type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
      }),
    ).toEqual({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
      message: '',
      filename: undefined,
      lineno: undefined,
      colno: undefined,
    });
  });

  it('should return null when data is null', () => {
    expect(parseFrontComponentSandboxMessage(null)).toBeNull();
  });

  it('should return null when data is a primitive', () => {
    expect(
      parseFrontComponentSandboxMessage('front-component-sandbox-ready'),
    ).toBeNull();
    expect(parseFrontComponentSandboxMessage(42)).toBeNull();
  });

  it('should return null when the type is missing', () => {
    expect(parseFrontComponentSandboxMessage({ message: 'hello' })).toBeNull();
  });

  it('should return null when the type is unknown', () => {
    expect(
      parseFrontComponentSandboxMessage({ type: 'unrelated-message' }),
    ).toBeNull();
  });
});
