import { installErrorEventBridge } from '../installErrorEventBridge';

class FakeErrorEvent {
  constructor(
    public type: string,
    public init: Record<string, unknown>,
  ) {}
}

class FakePromiseRejectionEvent {
  constructor(
    public type: string,
    public init: Record<string, unknown>,
  ) {}
}

const createScope = () => {
  const listeners = new Map<string, (event: unknown) => void>();
  const dispatchEvent = jest.fn((_event: object) => true);

  const scope = {
    window: { dispatchEvent },
    ErrorEvent: FakeErrorEvent,
    PromiseRejectionEvent: FakePromiseRejectionEvent,
    addEventListener: (type: string, listener: (event: unknown) => void) => {
      listeners.set(type, listener);
    },
  };

  return { scope, listeners, dispatchEvent };
};

describe('installErrorEventBridge', () => {
  it('should re-dispatch native error events onto the fake window', () => {
    const { scope, listeners, dispatchEvent } = createScope();

    installErrorEventBridge(scope as never);
    listeners.get('error')?.({
      message: 'boom',
      filename: 'app.js',
      lineno: 1,
      colno: 2,
      error: new Error('boom'),
    });

    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    const dispatched = dispatchEvent.mock.calls[0][0] as FakeErrorEvent;
    expect(dispatched).toBeInstanceOf(FakeErrorEvent);
    expect(dispatched.type).toBe('error');
    expect(dispatched.init.message).toBe('boom');
  });

  it('should re-dispatch native unhandledrejection events onto the fake window', () => {
    const { scope, listeners, dispatchEvent } = createScope();

    installErrorEventBridge(scope as never);
    const reason = new Error('rejected');
    const promise = Promise.resolve();
    listeners.get('unhandledrejection')?.({ reason, promise });

    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    const dispatched = dispatchEvent.mock
      .calls[0][0] as FakePromiseRejectionEvent;
    expect(dispatched).toBeInstanceOf(FakePromiseRejectionEvent);
    expect(dispatched.type).toBe('unhandledrejection');
    expect(dispatched.init.reason).toBe(reason);
    expect(dispatched.init.promise).toBe(promise);
  });

  it('should not throw when a fake window handler throws', () => {
    const { scope, listeners } = createScope();
    scope.window.dispatchEvent = jest.fn((_event: object): boolean => {
      throw new Error('handler exploded');
    });

    installErrorEventBridge(scope as never);

    expect(() => listeners.get('error')?.({ message: 'boom' })).not.toThrow();
  });

  it('should do nothing when there is no fake window', () => {
    const addEventListener = jest.fn();

    installErrorEventBridge({ addEventListener } as never);

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('should do nothing when the window is the global scope itself', () => {
    const addEventListener = jest.fn();
    const scope: Record<string, unknown> = { addEventListener };
    scope.window = scope;

    installErrorEventBridge(scope as never);

    expect(addEventListener).not.toHaveBeenCalled();
  });
});
