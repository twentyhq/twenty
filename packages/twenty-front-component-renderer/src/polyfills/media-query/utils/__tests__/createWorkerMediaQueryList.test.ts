import { createWorkerMediaQueryList } from '../createWorkerMediaQueryList';

const setupMediaQueryList = (initialMatches = false) => {
  let matches = initialMatches;
  const environmentListeners = new Set<() => void>();
  const unsubscribe = jest.fn();
  const reportListenerError = jest.fn();

  const subscribeToEnvironmentUpdates = jest.fn((listener: () => void) => {
    environmentListeners.add(listener);

    return () => {
      environmentListeners.delete(listener);
      unsubscribe();
    };
  });

  const mediaQueryList = createWorkerMediaQueryList({
    media: '(min-width: 600px)',
    evaluateMatches: () => matches,
    subscribeToEnvironmentUpdates,
    reportListenerError,
  });

  const setMatches = (nextMatches: boolean) => {
    matches = nextMatches;

    for (const environmentListener of [...environmentListeners]) {
      environmentListener();
    }
  };

  return {
    mediaQueryList,
    setMatches,
    subscribeToEnvironmentUpdates,
    unsubscribe,
    reportListenerError,
  };
};

describe('createWorkerMediaQueryList', () => {
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

  it('should notify listeners registered through the deprecated addListener alias', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const changeListener = jest.fn();

    mediaQueryList.addListener(changeListener);

    setMatches(true);
    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(changeListener).toHaveBeenCalledWith({
      type: 'change',
      media: '(min-width: 600px)',
      matches: true,
    });

    mediaQueryList.removeListener(changeListener);

    setMatches(false);
    expect(changeListener).toHaveBeenCalledTimes(1);
  });

  it('should invoke and clear the onchange handler', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    const onchangeHandler = jest.fn();

    mediaQueryList.onchange = onchangeHandler;

    setMatches(true);
    expect(onchangeHandler).toHaveBeenCalledTimes(1);

    mediaQueryList.onchange = null;

    setMatches(false);
    expect(onchangeHandler).toHaveBeenCalledTimes(1);
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

  it('should keep notifying remaining listeners when one of them throws', () => {
    const { mediaQueryList, setMatches, reportListenerError } =
      setupMediaQueryList();

    const listenerError = new Error('listener failure');
    const throwingListener = jest.fn(() => {
      throw listenerError;
    });
    const secondListener = jest.fn();

    mediaQueryList.addEventListener('change', throwingListener);
    mediaQueryList.addEventListener('change', secondListener);

    expect(() => setMatches(true)).not.toThrow();
    expect(secondListener).toHaveBeenCalledTimes(1);
    expect(reportListenerError).toHaveBeenCalledWith(listenerError);
  });
});
