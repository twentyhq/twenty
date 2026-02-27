import styled from '@emotion/styled';

import { ScrollWrapperInitEffect } from '@/ui/utilities/scroll/components/internal/ScrollWrapperInitEffect';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

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
`;

export type ScrollWrapperProps = {
  children: React.ReactNode;
  className?: string;
  defaultEnableXScroll?: boolean;
  defaultEnableYScroll?: boolean;
  componentInstanceId: string;
};

export const ScrollWrapper = ({
  componentInstanceId,
  children,
  className,
  defaultEnableXScroll = true,
  defaultEnableYScroll = true,
}: ScrollWrapperProps) => {
  const setScrollWrapperScrollTop = useSetAtomComponentState(
    scrollWrapperScrollTopComponentState,
    componentInstanceId,
  );

  const setScrollWrapperScrollLeft = useSetAtomComponentState(
    scrollWrapperScrollLeftComponentState,
    componentInstanceId,
  );

  const setScrollWrapperScrollBottom = useSetAtomComponentState(
    scrollWrapperScrollBottomComponentState,
    componentInstanceId,
  );

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollWrapperScrollTop(target.scrollTop);
    setScrollWrapperScrollLeft(target.scrollLeft);
    setScrollWrapperScrollBottom(
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
      >
        {children}
      </StyledScrollWrapper>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
