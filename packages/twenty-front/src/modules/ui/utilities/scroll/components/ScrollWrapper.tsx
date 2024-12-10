import styled from '@emotion/styled';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useOverlayScrollbars } from 'overlayscrollbars-react';
import { useEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';

import {
  ContextProviderName,
  getContextByProviderName,
} from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';
import { useScrollStates } from '@/ui/utilities/scroll/hooks/internal/useScrollStates';
import { overlayScrollbarsState } from '@/ui/utilities/scroll/states/overlayScrollbarsState';

import 'overlayscrollbars/overlayscrollbars.css';

const StyledScrollWrapper = styled.div<{ scrollHide?: boolean }>`
  display: flex;
  height: 100%;
  width: 100%;

  .os-scrollbar-handle {
    background-color: ${({ theme, scrollHide }) =>
      scrollHide ? 'transparent' : theme.border.color.medium};
  }
`;

const StyledInnerContainer = styled.div`
  height: 100%;
`;

export type ScrollWrapperProps = {
  children: React.ReactNode;
  className?: string;
  enableXScroll?: boolean;
  enableYScroll?: boolean;
  contextProviderName: ContextProviderName;
  scrollHide?: boolean;
};

export const ScrollWrapper = ({
  children,
  className,
  enableXScroll = true,
  enableYScroll = true,
  contextProviderName,
  scrollHide = false,
}: ScrollWrapperProps) => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const Context = getContextByProviderName(contextProviderName);

  const { scrollTopComponentState, scrollLeftComponentState } =
    useScrollStates(contextProviderName);
  const setScrollTop = useSetRecoilState(scrollTopComponentState);
  const setScrollLeft = useSetRecoilState(scrollLeftComponentState);
  const handleScroll = (overlayScroll: OverlayScrollbars) => {
    const target = overlayScroll.elements().scrollOffsetElement;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
  };

  const setOverlayScrollbars = useSetRecoilState(overlayScrollbarsState);

  const [initialize, instance] = useOverlayScrollbars({
    options: {
      scrollbars: { autoHide: 'scroll' },
      overflow: {
        x: enableXScroll ? undefined : 'hidden',
        y: enableYScroll ? undefined : 'hidden',
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

  useEffect(() => {
    setOverlayScrollbars(instance());
  }, [instance, setOverlayScrollbars]);

  return (
    <Context.Provider
      value={{
        ref: scrollableRef,
        id: contextProviderName,
      }}
    >
      <StyledScrollWrapper
        ref={scrollableRef}
        className={className}
        scrollHide={scrollHide}
      >
        <StyledInnerContainer>{children}</StyledInnerContainer>
      </StyledScrollWrapper>
    </Context.Provider>
  );
};
