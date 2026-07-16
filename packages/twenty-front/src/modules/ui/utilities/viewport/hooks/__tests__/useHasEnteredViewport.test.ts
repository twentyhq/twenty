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

    const elementRef = { current: document.createElement('div') };

    const { result } = renderHook(() => useHasEnteredViewport(elementRef));

    expect(result.current).toBe(true);
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

    const elementRef = { current: document.createElement('div') };

    const { result } = renderHook(() => useHasEnteredViewport(elementRef));

    expect(result.current).toBe(false);
    expect(observe).toHaveBeenCalledWith(elementRef.current);

    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(result.current).toBe(false);

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(result.current).toBe(true);
    expect(disconnect).toHaveBeenCalled();
  });

  it('does nothing when the element ref is empty', () => {
    const observe = jest.fn();

    class MockIntersectionObserver {
      observe = observe;
      disconnect = jest.fn();
    }

    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
      MockIntersectionObserver;

    const elementRef = { current: null };

    const { result } = renderHook(() => useHasEnteredViewport(elementRef));

    expect(result.current).toBe(false);
    expect(observe).not.toHaveBeenCalled();
  });
});
