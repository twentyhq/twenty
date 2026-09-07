import { Window } from '@remote-dom/polyfill';

import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type MediaQueryEnvironmentListener } from '@/polyfills/media-query/types/MediaQueryEnvironmentListener';
import { type createWorkerMediaQueryList as CreateWorkerMediaQueryList } from '@/polyfills/media-query/utils/createWorkerMediaQueryList';

const ENVIRONMENT: MediaQueryEnvironment = {
  componentWidth: 0,
  componentHeight: 0,
  devicePixelRatio: 1,
  colorScheme: 'light',
};

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
  const environmentListeners = new Set<MediaQueryEnvironmentListener>();
  const unsubscribe = jest.fn();

  const mediaQueryList = createWorkerMediaQueryList({
    media: '(min-width: 600px)',
    readEnvironment: () => ENVIRONMENT,
    evaluateMatches: () => matches,
    subscribeToEnvironmentUpdates: (listener) => {
      environmentListeners.add(listener);

      return () => {
        environmentListeners.delete(listener);
        unsubscribe();
      };
    },
  });

  const setMatches = (nextMatches: boolean) => {
    matches = nextMatches;

    for (const environmentListener of [...environmentListeners]) {
      environmentListener(ENVIRONMENT);
    }
  };

  return { mediaQueryList, setMatches, unsubscribe };
};

describe('createWorkerMediaQueryList on the remote-dom EventTarget the worker ships with', () => {
  it('should extend the remote-dom EventTarget', () => {
    const { mediaQueryList } = setupMediaQueryList();

    expect(mediaQueryList).toBeInstanceOf(polyfillWindow.EventTarget);
  });

  it('should dispatch remote-dom events carrying media and matches', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.addEventListener('change', changeListener);

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
  });

  it('should invoke a once listener that re-registers itself once per change', () => {
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

  it('should never invoke a listener whose signal was already aborted', () => {
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

  it('should release the environment subscription once the last listener is gone', () => {
    const { mediaQueryList, setMatches, unsubscribe } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.addEventListener('change', changeListener, { once: true });

    setMatches(true);
    setMatches(false);

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
