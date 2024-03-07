import React from 'react';
import { expect } from '@storybook/test';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useListenScroll } from '@/ui/utilities/scroll/hooks/useListenScroll';
import { isScrollingState } from '@/ui/utilities/scroll/states/isScrollingState';
import { isNonNullable } from '~/utils/isNonNullable';

const containerRef = React.createRef<HTMLDivElement>();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <div id="container" ref={containerRef}>
      {children}
    </div>
  </RecoilRoot>
);

jest.useFakeTimers();

describe('useListenScroll', () => {
  it('should trigger the callback when scrolling', () => {
    const { result } = renderHook(
      () => {
        useListenScroll({ scrollableRef: containerRef });
        const isScrolling = useRecoilValue(isScrollingState);

        return { isScrolling };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isScrolling).toBe(false);

    jest.advanceTimersByTime(500);

    const container = document.querySelector('#container');

    act(() => {
      if (isNonNullable(container)) fireEvent.scroll(container);
    });

    expect(result.current.isScrolling).toBe(true);
  });
});
