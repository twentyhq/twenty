import { createWorkerMediaQueryList } from '../createWorkerMediaQueryList';

const setupMediaQueryList = (initialMatches = false) => {
  let matches = initialMatches;
  const environmentListeners = new Set<() => void>();
  const unsubscribe = jest.fn();

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
  };
};

describe('createWorkerMediaQueryList', () => {
  afterEach(() => {
    jest.restoreAllMocks();
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

  it('should keep notifying remaining listeners when one of them throws', () => {
    const { mediaQueryList, setMatches } = setupMediaQueryList();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const throwingListener = jest.fn(() => {
      throw new Error('listener failure');
    });
    const secondListener = jest.fn();

    mediaQueryList.addEventListener('change', throwingListener);
    mediaQueryList.addEventListener('change', secondListener);

    expect(() => setMatches(true)).not.toThrow();
    expect(secondListener).toHaveBeenCalledTimes(1);
  });
});
