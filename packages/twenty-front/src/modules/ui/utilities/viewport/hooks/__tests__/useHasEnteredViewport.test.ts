import { act, renderHook } from '@testing-library/react';

import { useHasEnteredViewport } from '@/ui/utilities/viewport/hooks/useHasEnteredViewport';

describe('useHasEnteredViewport', () => {
  const originalIntersectionObserver = (
    globalThis as { IntersectionObserver?: unknown }
  ).IntersectionObserver;

  afterEach(() => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
      originalIntersectionObserver;
  });

  it('latches to true immediately when IntersectionObserver is unavailable', () => {
    delete (globalThis as { IntersectionObserver?: unknown })
      .IntersectionObserver;

    const { result } = renderHook(() => useHasEnteredViewport());

    act(() => {
      result.current.elementRef(document.createElement('div'));
    });

    expect(result.current.hasEnteredViewport).toBe(true);
  });

  it('stays false until the element intersects, then latches to true', () => {
    let observerCallback: IntersectionObserverCallback = () => {};
    const observe = jest.fn();
    const disconnect = jest.fn();

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }

      observe = observe;
      disconnect = disconnect;
    }

    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
      MockIntersectionObserver;

    const element = document.createElement('div');

    const { result } = renderHook(() => useHasEnteredViewport());

    act(() => {
      result.current.elementRef(element);
    });

    expect(result.current.hasEnteredViewport).toBe(false);
    expect(observe).toHaveBeenCalledWith(element);

    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(result.current.hasEnteredViewport).toBe(false);

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(result.current.hasEnteredViewport).toBe(true);
    expect(disconnect).toHaveBeenCalled();
  });

  it('does nothing while no element is attached', () => {
    const observe = jest.fn();

    class MockIntersectionObserver {
      observe = observe;
      disconnect = jest.fn();
    }

    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
      MockIntersectionObserver;

    const { result } = renderHook(() => useHasEnteredViewport());

    expect(result.current.hasEnteredViewport).toBe(false);
    expect(observe).not.toHaveBeenCalled();
  });

  it('starts observing when the element appears after the first render', () => {
    let observerCallback: IntersectionObserverCallback = () => {};
    const observe = jest.fn();

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }

      observe = observe;
      disconnect = jest.fn();
    }

    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
      MockIntersectionObserver;

    const { result } = renderHook(() => useHasEnteredViewport());

    expect(observe).not.toHaveBeenCalled();

    const lateElement = document.createElement('div');

    act(() => {
      result.current.elementRef(lateElement);
    });

    expect(observe).toHaveBeenCalledWith(lateElement);

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(result.current.hasEnteredViewport).toBe(true);
  });
});
