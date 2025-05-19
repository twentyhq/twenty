import { fireEvent, renderHook } from '@testing-library/react';
import React, { act } from 'react';
import { RecoilRoot } from 'recoil';

import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from 'twenty-shared/utils';

const containerRef = React.createRef<HTMLDivElement>();

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
});
