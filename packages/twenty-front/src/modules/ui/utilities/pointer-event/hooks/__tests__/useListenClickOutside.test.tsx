import { fireEvent, renderHook } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { RecoilRoot } from 'recoil';

import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

const containerRef = React.createRef<HTMLDivElement>();
const nullRef = React.createRef<HTMLDivElement>();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <div ref={containerRef}>{children}</div>
  </RecoilRoot>
);

const listenerId = 'listenerId';
describe('useListenClickOutside', () => {
  it('should trigger the callback when clicking outside the specified refs', () => {
    const callback = jest.fn();

    renderHook(
      () =>
        useListenClickOutside({
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
        useListenClickOutside({
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
        useListenClickOutside({
          refs: [containerRef],
          callback,
          listenerId,
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

  it('should not call the callback when clicking inside the specified refs using pixel comparison', () => {
    const callback = jest.fn();

    renderHook(
      () =>
        useListenClickOutside({
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
        fireEvent.click(containerRef.current);
      }
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
