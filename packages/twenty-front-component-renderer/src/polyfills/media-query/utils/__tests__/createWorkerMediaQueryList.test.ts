import { Window } from '@remote-dom/polyfill';

import { type createWorkerMediaQueryList as CreateWorkerMediaQueryList } from '@/polyfills/media-query/utils/createWorkerMediaQueryList';
import { createSubscriptionStub } from '@/testing/createSubscriptionStub';

const polyfillWindow = new Window();

let createWorkerMediaQueryList: typeof CreateWorkerMediaQueryList;

beforeAll(async () => {
  Object.defineProperty(globalThis, 'EventTarget', {
    value: polyfillWindow.EventTarget,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'Event', {
    value: polyfillWindow.Event,
    writable: true,
    configurable: true,
  });

  ({ createWorkerMediaQueryList } =
    await import('@/polyfills/media-query/utils/createWorkerMediaQueryList'));
});

const setupMediaQueryList = () => {
  let matches = false;
  const reportListenerError = jest.fn();
  const environmentSubscription = createSubscriptionStub();

  const mediaQueryList = createWorkerMediaQueryList({
    media: '(min-width: 600px)',
    evaluateMatches: () => matches,
    subscribeToEnvironmentUpdates: environmentSubscription.subscribe,
    reportListenerError,
  });

  const setMatches = (nextMatches: boolean) => {
    matches = nextMatches;
    environmentSubscription.notify();
  };

  return {
    mediaQueryList,
    setMatches,
    subscribeToEnvironmentUpdates: environmentSubscription.subscribe,
    unsubscribe: environmentSubscription.unsubscribe,
    reportListenerError,
  };
};

describe('createWorkerMediaQueryList', () => {
  it('should extend the EventTarget the worker ships with', () => {
    const { mediaQueryList } = setupMediaQueryList();

    expect(mediaQueryList).toBeInstanceOf(polyfillWindow.EventTarget);
  });

  it('should expose live matches without any listener attached', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();

    expect(mediaQueryList.matches).toBe(false);

    setMatches(true);

    expect(mediaQueryList.matches).toBe(true);
  });

  it('should not subscribe to environment updates until a listener is attached', () => {
    const { mediaQueryList, subscribeToEnvironmentUpdates } =
      setupMediaQueryList();

    expect(subscribeToEnvironmentUpdates).not.toHaveBeenCalled();

    mediaQueryList.addEventListener('change', jest.fn());

    expect(subscribeToEnvironmentUpdates).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe from environment updates when the last listener is removed', () => {
    const { mediaQueryList, unsubscribe } = setupMediaQueryList();
    const firstListener = jest.fn();
    const secondListener = jest.fn();

    mediaQueryList.addEventListener('change', firstListener);
    mediaQueryList.addListener(secondListener);

    mediaQueryList.removeEventListener('change', firstListener);
    expect(unsubscribe).not.toHaveBeenCalled();

    mediaQueryList.removeListener(secondListener);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should ignore events other than change and non-function listeners', () => {
    const { mediaQueryList, subscribeToEnvironmentUpdates, setMatches } =
      setupMediaQueryList();

    mediaQueryList.addEventListener('resize', jest.fn());
    expect(subscribeToEnvironmentUpdates).not.toHaveBeenCalled();

    expect(() => {
      mediaQueryList.addListener(
        null as unknown as Parameters<typeof mediaQueryList.addListener>[0],
      );
      setMatches(true);
    }).not.toThrow();
  });

  it('should dispatch events carrying media and matches', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.addListener(changeListener);

    setMatches(true);
    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(changeListener.mock.calls[0][0]).toBeInstanceOf(
      polyfillWindow.Event,
    );
    expect(changeListener.mock.calls[0][0]).toMatchObject({
      type: 'change',
      media: '(min-width: 600px)',
      matches: true,
    });

    mediaQueryList.removeListener(changeListener);

    setMatches(false);
    expect(changeListener).toHaveBeenCalledTimes(1);
  });

  it('should invoke and clear the onchange handler', () => {
    const { mediaQueryList, setMatches, unsubscribe } = setupMediaQueryList();
    const onchangeHandler = jest.fn();

    mediaQueryList.onchange = onchangeHandler;

    setMatches(true);
    expect(onchangeHandler).toHaveBeenCalledTimes(1);

    mediaQueryList.onchange = null;

    setMatches(false);
    expect(onchangeHandler).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should invoke the onchange handler in its registration position', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const invocationOrder: string[] = [];

    mediaQueryList.addEventListener('change', () =>
      invocationOrder.push('first'),
    );
    mediaQueryList.onchange = () => invocationOrder.push('onchange');
    mediaQueryList.addEventListener('change', () =>
      invocationOrder.push('last'),
    );

    setMatches(true);

    expect(invocationOrder).toEqual(['first', 'onchange', 'last']);
  });

  it('should keep the onchange position when the handler is reassigned', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const invocationOrder: string[] = [];

    mediaQueryList.addEventListener('change', () =>
      invocationOrder.push('first'),
    );
    mediaQueryList.onchange = () => invocationOrder.push('initial');
    mediaQueryList.addEventListener('change', () =>
      invocationOrder.push('last'),
    );
    mediaQueryList.onchange = () => invocationOrder.push('reassigned');

    setMatches(true);

    expect(invocationOrder).toEqual(['first', 'reassigned', 'last']);
  });

  it('should invoke a function that is both the onchange handler and a listener twice', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.addEventListener('change', changeListener);
    mediaQueryList.onchange = changeListener;

    setMatches(true);

    expect(changeListener).toHaveBeenCalledTimes(2);
  });

  it('should keep an explicit listener when onchange is cleared', () => {
    const { mediaQueryList, setMatches, unsubscribe } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.addEventListener('change', changeListener);
    mediaQueryList.onchange = changeListener;
    mediaQueryList.onchange = null;

    setMatches(true);

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it('should keep the onchange handler when the same function is removed as a listener', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.onchange = changeListener;
    mediaQueryList.removeListener(changeListener);

    setMatches(true);

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(mediaQueryList.onchange).toBe(changeListener);
  });

  it('should invoke a once listener a single time and release the subscription', () => {
    const { mediaQueryList, setMatches, unsubscribe } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.addEventListener('change', changeListener, { once: true });

    setMatches(true);
    setMatches(false);

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should invoke a listener registered plainly and with once exactly once per change', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.addEventListener('change', changeListener);
    mediaQueryList.addEventListener('change', changeListener, { once: true });

    setMatches(true);
    expect(changeListener).toHaveBeenCalledTimes(1);

    setMatches(false);
    expect(changeListener).toHaveBeenCalledTimes(2);
  });

  it('should keep a re-added listener alive after its once registration was removed', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.addEventListener('change', changeListener, { once: true });
    mediaQueryList.removeEventListener('change', changeListener);
    mediaQueryList.addEventListener('change', changeListener);

    setMatches(true);
    setMatches(false);
    setMatches(true);

    expect(changeListener).toHaveBeenCalledTimes(3);
  });

  it('should keep firing a once listener that re-registers itself', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const MAXIMUM_INVOCATIONS = 10;
    const changeListener = jest.fn(() => {
      if (changeListener.mock.calls.length >= MAXIMUM_INVOCATIONS) {
        return;
      }

      mediaQueryList.addEventListener('change', changeListener, { once: true });
    });

    mediaQueryList.addEventListener('change', changeListener, { once: true });

    setMatches(true);
    setMatches(false);
    setMatches(true);

    expect(changeListener).toHaveBeenCalledTimes(3);
  });

  it('should detach a listener when its abort signal fires', () => {
    const { mediaQueryList, setMatches, unsubscribe } = setupMediaQueryList();
    const abortController = new AbortController();
    const changeListener = jest.fn();

    mediaQueryList.addEventListener('change', changeListener, {
      signal: abortController.signal,
    });

    abortController.abort();
    setMatches(true);

    expect(changeListener).not.toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should ignore a listener whose signal is already aborted', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const abortController = new AbortController();
    const abortedListener = jest.fn();
    const liveListener = jest.fn();

    abortController.abort();
    mediaQueryList.addEventListener('change', abortedListener, {
      signal: abortController.signal,
    });
    mediaQueryList.addEventListener('change', liveListener);

    setMatches(true);

    expect(abortedListener).not.toHaveBeenCalled();
    expect(liveListener).toHaveBeenCalledTimes(1);
  });

  it('should keep a re-added listener alive after its previous abort signal fires', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const abortController = new AbortController();
    const changeListener = jest.fn();

    mediaQueryList.addEventListener('change', changeListener, {
      signal: abortController.signal,
    });
    mediaQueryList.removeEventListener('change', changeListener);
    mediaQueryList.addEventListener('change', changeListener);
    abortController.abort();

    setMatches(true);

    expect(changeListener).toHaveBeenCalledTimes(1);
  });

  it('should accept null listener options', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const changeListener = jest.fn();

    expect(() => {
      mediaQueryList.addEventListener(
        'change',
        changeListener,
        null as unknown as AddEventListenerOptions,
      );
    }).not.toThrow();

    setMatches(true);

    expect(changeListener).toHaveBeenCalledTimes(1);
  });

  it('should notify listeners passed as an object with handleEvent', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const handleEvent = jest.fn();

    mediaQueryList.addEventListener('change', { handleEvent });

    setMatches(true);

    expect(handleEvent).toHaveBeenCalledTimes(1);
  });

  it('should report a throwing listener and keep notifying the remaining ones', () => {
    const { mediaQueryList, setMatches, reportListenerError } =
      setupMediaQueryList();
    const listenerFailure = new Error('listener failure');
    const throwingListener = jest.fn(() => {
      throw listenerFailure;
    });
    const secondListener = jest.fn();

    mediaQueryList.addEventListener('change', throwingListener);
    mediaQueryList.addEventListener('change', secondListener);

    expect(() => setMatches(true)).not.toThrow();
    expect(reportListenerError).toHaveBeenCalledWith(listenerFailure);
    expect(secondListener).toHaveBeenCalledTimes(1);
  });

  it('should not invoke a listener removed by an earlier listener during dispatch', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();

    const secondListener = jest.fn();
    const firstListener = jest.fn(() => {
      mediaQueryList.removeEventListener('change', secondListener);
    });

    mediaQueryList.addEventListener('change', firstListener);
    mediaQueryList.addEventListener('change', secondListener);

    setMatches(true);

    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).not.toHaveBeenCalled();
  });

  it('should not invoke a listener added during dispatch until the next change', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const lateListener = jest.fn();

    mediaQueryList.addEventListener('change', () => {
      mediaQueryList.addEventListener('change', lateListener);
    });

    setMatches(true);
    expect(lateListener).not.toHaveBeenCalled();

    setMatches(false);
    expect(lateListener).toHaveBeenCalledTimes(1);
  });

  it('should stop at a listener that stops immediate propagation and still remove it when once', () => {
    const { mediaQueryList, setMatches, unsubscribe } = setupMediaQueryList();
    const stoppingListener = jest.fn((event: Event) => {
      event.stopImmediatePropagation();
    });
    const laterListener = jest.fn();

    mediaQueryList.addEventListener('change', stoppingListener, { once: true });
    mediaQueryList.addEventListener('change', laterListener);

    setMatches(true);
    expect(stoppingListener).toHaveBeenCalledTimes(1);
    expect(laterListener).not.toHaveBeenCalled();

    setMatches(false);
    expect(stoppingListener).toHaveBeenCalledTimes(1);
    expect(laterListener).toHaveBeenCalledTimes(1);

    mediaQueryList.removeEventListener('change', laterListener);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
