import styled from '@emotion/styled';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useOverlayScrollbars } from 'overlayscrollbars-react';
import { useEffect, useRef } from 'react';

import {
  ContextProviderName,
  getContextByProviderName,
} from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';

import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrappeScrollBottomComponentState';
import { scrollWrapperInstanceComponentState } from '@/ui/utilities/scroll/states/scrollWrapperInstanceComponentState';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { css } from '@emotion/react';
import 'overlayscrollbars/overlayscrollbars.css';

type HeightMode = 'full' | 'fit-content';

const StyledScrollWrapper = styled.div<{
  heightMode: HeightMode;
  scrollbarVariant: 'with-padding' | 'no-padding';
}>`
  display: flex;
  height: ${({ heightMode }) => {
    switch (heightMode) {
      case 'full':
        return '100%';
      case 'fit-content':
        return 'fit-content';
    }
  }};
  width: 100%;

  .os-scrollbar-handle {
    background-color: ${({ theme }) => theme.border.color.strong};
  }

  // Keep horizontal scrollbar always visible
  .os-scrollbar-horizontal {
    &.os-scrollbar-auto-hide {
      opacity: 1;
      visibility: visible;
    }
    .os-scrollbar-track {
      visibility: visible !important;
    }
  }

  .os-scrollbar {
    transition:
      opacity 300ms,
      visibility 300ms,
      top 300ms,
      right 300ms,
      bottom 300ms,
      left 300ms;
  }

  ${({ scrollbarVariant }) =>
    scrollbarVariant === 'no-padding' &&
    css`
      .os-scrollbar {
        --os-size: 6px;
        padding: 0px;
      }
    `}
`;

const StyledInnerContainer = styled.div`
  height: 100%;
`;

export type ScrollWrapperProps = {
  children: React.ReactNode;
  className?: string;
  heightMode?: HeightMode;
  defaultEnableXScroll?: boolean;
  defaultEnableYScroll?: boolean;
  contextProviderName: ContextProviderName;
  componentInstanceId: string;
  scrollbarVariant?: 'with-padding' | 'no-padding';
};

export const ScrollWrapper = ({
  componentInstanceId,
  children,
  className,
  heightMode = 'full',
  defaultEnableXScroll = true,
  defaultEnableYScroll = true,
  contextProviderName,
  scrollbarVariant = 'with-padding',
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

  const setScrollBottom = useSetRecoilComponentStateV2(
    scrollWrapperScrollBottomComponentState,
    componentInstanceId,
  );

  const handleScroll = (overlayScroll: OverlayScrollbars) => {
    const target = overlayScroll.elements().scrollOffsetElement;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
    setScrollBottom(
      target.scrollHeight - target.clientHeight - target.scrollTop,
    );
  };

  const setOverlayScrollbars = useSetRecoilComponentStateV2(
    scrollWrapperInstanceComponentState,
    componentInstanceId,
  );

  const [initialize, instance] = useOverlayScrollbars({
    options: {
      scrollbars: {
        autoHide: 'scroll',
        autoHideDelay: 500,
      },
      overflow: {
        x: defaultEnableXScroll ? undefined : 'hidden',
        y: defaultEnableYScroll ? undefined : 'hidden',
      },
    },
    events: {
      updated: (osInstance) => {
        const { scrollOffsetElement: target } = osInstance.elements();
        setScrollBottom(
          target.scrollHeight - target.clientHeight - target.scrollTop,
        );
      },
      scroll: (osInstance) => {
        const { scrollOffsetElement: target, scrollbarVertical } =
          osInstance.elements();
        // Hide vertical scrollbar by default
        if (scrollbarVertical !== null) {
          scrollbarVertical.track.style.visibility = 'hidden';
        }

        // Show vertical scrollbar based on scroll direction
        const isVerticalScroll =
          target.scrollTop !== Number(target.dataset.lastScrollTop || '0');

        if (
          isVerticalScroll === true &&
          scrollbarVertical !== null &&
          target.scrollHeight > target.clientHeight
        ) {
          scrollbarVertical.track.style.visibility = 'visible';
        }
        // Update vertical scroll positions
        target.dataset.lastScrollTop = target.scrollTop.toString();

        handleScroll(osInstance);
      },
    },
  });

  useEffect(() => {
    const currentRef = scrollableRef.current;
    if (currentRef !== null) {
      initialize(currentRef);
    }
    return () => {
      // Reset vertical scroll component-specific Recoil state
      setScrollTop(0);
      setOverlayScrollbars(null);
      instance()?.destroy();
    };
  }, [initialize, instance, setScrollTop, setOverlayScrollbars]);

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
          heightMode={heightMode}
          scrollbarVariant={scrollbarVariant}
        >
          <StyledInnerContainer>{children}</StyledInnerContainer>
        </StyledScrollWrapper>
      </Context.Provider>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
