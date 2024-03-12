import React from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent, render, renderHook } from '@testing-library/react';

import { isDefined } from '~/utils/isDefined';

import {
  ClickOutsideMode,
  useListenClickOutside,
  useListenClickOutsideByClassName,
} from '../useListenClickOutside';

const containerRef = React.createRef<HTMLDivElement>();
const nullRef = React.createRef<HTMLDivElement>();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div ref={containerRef}>{children}</div>
);

describe('useListenClickOutside', () => {
  it('should trigger the callback when clicking outside the specified refs', () => {
    const callback = jest.fn();

    renderHook(
      () => useListenClickOutside({ refs: [containerRef], callback }),
      { wrapper: Wrapper },
    );

    act(() => {
      fireEvent.mouseDown(document);
      fireEvent.click(document);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should not call the callback when clicking inside the specified refs using pixel comparison', () => {
    const callback = jest.fn();

    renderHook(
      () =>
        useListenClickOutside({
          refs: [containerRef, nullRef],
          callback,
          mode: ClickOutsideMode.comparePixels,
        }),
      { wrapper: Wrapper },
    );

    act(() => {
      if (isDefined(containerRef.current)) {
        fireEvent.mouseDown(containerRef.current);
        fireEvent.click(containerRef.current);
      }
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should call the callback when clicking outside the specified refs using pixel comparison', () => {
    const callback = jest.fn();

    renderHook(() =>
      useListenClickOutside({
        refs: [containerRef, nullRef],
        callback,
        mode: ClickOutsideMode.comparePixels,
      }),
    );

    act(() => {
      // Simulate a click outside the specified refs
      fireEvent.mouseDown(document.body);
      fireEvent.click(document.body);
    });

    expect(callback).toHaveBeenCalled();
  });
});

describe('useListenClickOutsideByClassName', () => {
  it('should trigger the callback when clicking outside the specified class names', () => {
    const callback = jest.fn();
    const { container } = render(
      <div>
        <div className="wont-trigger other-class">Inside</div>
        <div className="will-trigger">Outside</div>
      </div>,
    );

    renderHook(() =>
      useListenClickOutsideByClassName({
        classNames: ['wont-trigger'],
        callback,
      }),
    );

    act(() => {
      const notClickableElement = container.querySelector('.will-trigger');
      if (isDefined(notClickableElement)) {
        fireEvent.mouseDown(notClickableElement);
        fireEvent.click(notClickableElement);
      }
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should not trigger the callback when clicking inside the specified class names', () => {
    const callback = jest.fn();
    const { container } = render(
      <div>
        <div className="wont-trigger other-class">Inside</div>
        <div className="will-trigger">Outside</div>
      </div>,
    );

    renderHook(() =>
      useListenClickOutsideByClassName({
        classNames: ['wont-trigger'],
        callback,
      }),
    );

    act(() => {
      const notClickableElement = container.querySelector('.wont-trigger');
      if (isDefined(notClickableElement)) {
        fireEvent.mouseDown(notClickableElement);
        fireEvent.click(notClickableElement);
      }
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
