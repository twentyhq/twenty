import { fireEvent, renderHook } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { RecoilRoot } from 'recoil';

import {
  ClickOutsideMode,
  useListenClickOutsideV2,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutsideV2';
import { isDefined } from '~/utils/isDefined';

const containerRef = React.createRef<HTMLDivElement>();
const nullRef = React.createRef<HTMLDivElement>();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <div ref={containerRef}>{children}</div>
  </RecoilRoot>
);

const listenerId = 'listenerId';

describe('useListenClickOutsideV2', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should trigger the callback when clicking outside the specified refs', () => {
    const callback = jest.fn();

    renderHook(
      () =>
        useListenClickOutsideV2({
          refs: [containerRef],
          callback,
          listenerId,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      fireEvent.mouseDown(document);
      jest.advanceTimersByTime(10);
      fireEvent.click(document);
    });

    callback.mockClear();

    act(() => {
      fireEvent.mouseDown(document);
      jest.advanceTimersByTime(10);
      fireEvent.click(document);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should trigger the callback when clicking outside the specified ref with pixel comparison', () => {
    const callback = jest.fn();

    renderHook(
      () =>
        useListenClickOutsideV2({
          refs: [nullRef],
          callback,
          mode: ClickOutsideMode.comparePixels,
          listenerId,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      fireEvent.mouseDown(document);
      jest.advanceTimersByTime(10);
      fireEvent.click(document);
    });

    callback.mockClear();

    act(() => {
      fireEvent.mouseDown(document);
      jest.advanceTimersByTime(10);
      fireEvent.click(document);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should not call the callback when clicking inside the specified refs using default comparison', () => {
    const callback = jest.fn();

    renderHook(
      () =>
        useListenClickOutsideV2({
          refs: [containerRef],
          callback,
          listenerId,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      if (isDefined(containerRef.current)) {
        fireEvent.mouseDown(containerRef.current);
        jest.advanceTimersByTime(10);
        fireEvent.click(containerRef.current);
      }
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call the callback when clicking inside the specified refs using pixel comparison', () => {
    const callback = jest.fn();

    renderHook(
      () =>
        useListenClickOutsideV2({
          refs: [containerRef],
          callback,
          mode: ClickOutsideMode.comparePixels,
          listenerId,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      if (isDefined(containerRef.current)) {
        fireEvent.mouseDown(containerRef.current);
        jest.advanceTimersByTime(10);
        fireEvent.click(containerRef.current);
      }
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not trigger the callback on initial mount', () => {
    const callback = jest.fn();

    renderHook(
      () =>
        useListenClickOutsideV2({
          refs: [containerRef],
          callback,
          listenerId,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      fireEvent.mouseDown(document);
      jest.advanceTimersByTime(10);
      fireEvent.click(document);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not trigger callback for mouse events immediately after touch events', () => {
    const callback = jest.fn();

    renderHook(
      () =>
        useListenClickOutsideV2({
          refs: [containerRef],
          callback,
          listenerId,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      fireEvent.touchStart(document);
      jest.advanceTimersByTime(10);
      fireEvent.touchEnd(document);
    });

    callback.mockClear();

    act(() => {
      fireEvent.touchStart(document);
      jest.advanceTimersByTime(10);
      fireEvent.touchEnd(document);
      jest.advanceTimersByTime(10);
      fireEvent.mouseDown(document);
      jest.advanceTimersByTime(10);
      fireEvent.click(document);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
