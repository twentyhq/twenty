import styled from '@emotion/styled';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useOverlayScrollbars } from 'overlayscrollbars-react';
import { useEffect, useRef } from 'react';

import {
  ContextProviderName,
  getContextByProviderName,
} from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';

import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { scrollWrapperInstanceComponentState } from '@/ui/utilities/scroll/states/scrollWrapperInstanceComponentState';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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
  defaultEnableXScroll?: boolean;
  defaultEnableYScroll?: boolean;
  contextProviderName: ContextProviderName;
  scrollHide?: boolean;
  componentInstanceId: string;
};

export const ScrollWrapper = ({
  componentInstanceId,
  children,
  className,
  defaultEnableXScroll = true,
  defaultEnableYScroll = true,
  contextProviderName,
  scrollHide = false,
}: ScrollWrapperProps) => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const Context = getContextByProviderName(contextProviderName);

  const setScrollTop = useSetRecoilComponentStateV2(
    scrollWrapperScrollTopComponentState,
    componentInstanceId,
  );

  const setScrollLeft = useSetRecoilComponentStateV2(
    scrollWrapperScrollLeftComponentState,
    componentInstanceId,
  );

  const handleScroll = (overlayScroll: OverlayScrollbars) => {
    const target = overlayScroll.elements().scrollOffsetElement;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
  };

  const setOverlayScrollbars = useSetRecoilComponentStateV2(
    scrollWrapperInstanceComponentState,
    componentInstanceId,
  );

  const [initialize, instance] = useOverlayScrollbars({
    options: {
      scrollbars: { autoHide: 'scroll' },
      overflow: {
        x: defaultEnableXScroll ? undefined : 'hidden',
        y: defaultEnableYScroll ? undefined : 'hidden',
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
    <ScrollWrapperComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
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
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
