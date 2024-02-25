import React from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import {
  ClickOutsideMode,
  useListenClickOutsideV2,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutsideV2';

const containerRef = React.createRef<HTMLDivElement>();
const nullRef = React.createRef<HTMLDivElement>();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <div ref={containerRef}>{children}</div>
  </RecoilRoot>
);

const listenerId = 'listenerId';
describe('useListenClickOutsideV2', () => {
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
      fireEvent.click(document);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should trigger the callback when clicking outside the specified ref with pixel comparison', async () => {
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
      if (containerRef.current) {
        fireEvent.mouseDown(containerRef.current);
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
      if (containerRef.current) {
        fireEvent.mouseDown(containerRef.current);
        fireEvent.click(containerRef.current);
      }
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
