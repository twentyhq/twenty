import { createOutboundRequestSignal } from 'src/engine/core-modules/secure-http-client/utils/create-outbound-request-signal.util';

const wait = (durationMs: number) =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

describe('createOutboundRequestSignal', () => {
  // AbortSignal.timeout runs on Node's internal timers, which fake timers do not advance.
  beforeEach(() => {
    jest.useRealTimers();
  });

  it('aborts after the timeout when the caller passes no signal', async () => {
    const signal = createOutboundRequestSignal({
      currentSignal: undefined,
      timeoutMs: 10,
    });

    expect(signal.aborted).toBe(false);
    await wait(30);
    expect(signal.aborted).toBe(true);
  });

  it('aborts when the caller signal aborts', () => {
    const callerAbortController = new AbortController();

    const signal = createOutboundRequestSignal({
      currentSignal: callerAbortController.signal,
      timeoutMs: 60_000,
    });

    callerAbortController.abort();

    expect(signal.aborted).toBe(true);
  });

  it('gives a retried request a fresh timeout while keeping the caller signal', async () => {
    const callerAbortController = new AbortController();

    const firstAttemptSignal = createOutboundRequestSignal({
      currentSignal: callerAbortController.signal,
      timeoutMs: 10,
    });

    await wait(30);
    expect(firstAttemptSignal.aborted).toBe(true);

    const retrySignal = createOutboundRequestSignal({
      currentSignal: firstAttemptSignal,
      timeoutMs: 60_000,
    });

    expect(retrySignal.aborted).toBe(false);

    callerAbortController.abort();

    expect(retrySignal.aborted).toBe(true);
  });

  it('gives a retried request without a caller signal a fresh timeout', async () => {
    const firstAttemptSignal = createOutboundRequestSignal({
      currentSignal: undefined,
      timeoutMs: 10,
    });

    await wait(30);

    const retrySignal = createOutboundRequestSignal({
      currentSignal: firstAttemptSignal,
      timeoutMs: 60_000,
    });

    expect(retrySignal.aborted).toBe(false);
  });

  it('applies cancellation from a non-native caller signal', () => {
    const listeners: (() => void)[] = [];
    const callerSignal = {
      aborted: false,
      addEventListener: (_type: string, listener: () => void) => {
        listeners.push(listener);
      },
    };

    const signal = createOutboundRequestSignal({
      currentSignal: callerSignal,
      timeoutMs: 60_000,
    });

    expect(signal.aborted).toBe(false);

    listeners.forEach((listener) => listener());

    expect(signal.aborted).toBe(true);
  });
});
