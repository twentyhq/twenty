import { createContext, RefObject, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { OverlayScrollbars } from 'overlayscrollbars';
import {
  useOverlayScrollbars,
  UseOverlayScrollbarsInstance,
} from 'overlayscrollbars-react';
import { useRecoilCallback } from 'recoil';

import { scrollLeftState } from '@/ui/utilities/scroll/states/scrollLeftState';
import { scrollTopState } from '@/ui/utilities/scroll/states/scrollTopState';

import 'overlayscrollbars/overlayscrollbars.css';

export const ScrollWrapperContext = createContext<{
  ref: RefObject<HTMLDivElement>;
  instance?: UseOverlayScrollbarsInstance;
}>({
  ref: {
    current: null,
  },
});

const StyledScrollWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;

  .os-scrollbar-handle {
    background-color: ${({ theme }) => theme.border.color.medium};
  }
`;

export type ScrollWrapperProps = {
  children: React.ReactNode;
  className?: string;
  hideY?: boolean;
  hideX?: boolean;
};

export const ScrollWrapper = ({
  children,
  className,
  hideX,
  hideY,
}: ScrollWrapperProps) => {
  const scrollableRef = useRef<HTMLDivElement>(null);

  const handleScroll = useRecoilCallback(
    ({ set }) =>
      (overlayScroll: OverlayScrollbars) => {
        const target = overlayScroll.elements().scrollOffsetElement;
        set(scrollTopState, target.scrollTop);
        set(scrollLeftState, target.scrollLeft);
      },
    [],
  );

  const [initialize, instance] = useOverlayScrollbars({
    options: {
      scrollbars: { autoHide: 'scroll' },
      overflow: {
        y: hideY ? 'hidden' : undefined,
        x: hideX ? 'hidden' : undefined,
      },
    },
    events: {
      scroll: handleScroll,
    },
  });

  useEffect(() => {
    if (scrollableRef?.current !== null) {
      initialize(scrollableRef.current);
    }
  }, [initialize, scrollableRef]);

  return (
    <ScrollWrapperContext.Provider value={{ ref: scrollableRef, instance }}>
      <StyledScrollWrapper
        ref={scrollableRef}
        className={className}
        id="scroll-wrapper"
      >
        {children}
      </StyledScrollWrapper>
    </ScrollWrapperContext.Provider>
  );
};
