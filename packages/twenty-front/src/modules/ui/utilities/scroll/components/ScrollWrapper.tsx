import { createContext, RefObject, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useOverlayScrollbars } from 'overlayscrollbars-react';
import { useRecoilCallback } from 'recoil';
import 'overlayscrollbars/overlayscrollbars.css';
import { useScrollStates } from '@/ui/utilities/scroll/hooks/useScrollSates';

export const ScrollWrapperContext = createContext<RefObject<HTMLDivElement>>({
  current: null,
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
  const {scrollLeftState, scrollTopState} = useScrollStates()

  const handleScroll = useRecoilCallback(
    ({ set }) =>
      (overlayScroll: OverlayScrollbars) => {
        const target = overlayScroll.elements().scrollOffsetElement;
        set(scrollTopState, target.scrollTop);
        set(scrollLeftState, target.scrollLeft);
      },
    [],
  );

  const [initialize] = useOverlayScrollbars({
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
    <ScrollWrapperContext.Provider value={scrollableRef}>
      <StyledScrollWrapper ref={scrollableRef} className={className}>
        {children}
      </StyledScrollWrapper>
    </ScrollWrapperContext.Provider>
  );
};
