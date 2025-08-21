import styled from '@emotion/styled';

import { ScrollWrapperInitEffect } from '@/ui/utilities/scroll/components/internal/ScrollWrapperInitEffect';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

const StyledScrollWrapper = styled.div`
  &.scroll-wrapper-x-enabled {
    overflow-x: overlay;
  }
  &.scroll-wrapper-y-enabled {
    overflow-y: overlay;
  }
  overflow-x: hidden;
  overflow-y: hidden;
  width: 100%;
  height: 100%;

  &[data-select-on-click='true'] {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    cursor: default;

    * {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }

  &[data-select-on-click='false'] {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
    cursor: text;
  }
`;

export type ScrollWrapperProps = {
  children: React.ReactNode;
  className?: string;
  defaultEnableXScroll?: boolean;
  defaultEnableYScroll?: boolean;
  componentInstanceId: string;
  preventTextSelection?: boolean;
};

export const ScrollWrapper = ({
  componentInstanceId,
  children,
  className,
  defaultEnableXScroll = true,
  defaultEnableYScroll = true,
  preventTextSelection = false,
}: ScrollWrapperProps) => {
  const setScrollTop = useSetRecoilComponentState(
    scrollWrapperScrollTopComponentState,
    componentInstanceId,
  );

  const setScrollLeft = useSetRecoilComponentState(
    scrollWrapperScrollLeftComponentState,
    componentInstanceId,
  );

  const setScrollBottom = useSetRecoilComponentState(
    scrollWrapperScrollBottomComponentState,
    componentInstanceId,
  );

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
    setScrollBottom(
      target.scrollHeight - target.clientHeight - target.scrollTop,
    );
  };

  return (
    <ScrollWrapperComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <ScrollWrapperInitEffect
        defaultEnableXScroll={defaultEnableXScroll}
        defaultEnableYScroll={defaultEnableYScroll}
      />
      <StyledScrollWrapper
        id={`scroll-wrapper-${componentInstanceId}`}
        className={className}
        onScroll={handleScroll}
        data-select-on-click={preventTextSelection}
      >
        {children}
      </StyledScrollWrapper>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
