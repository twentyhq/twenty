import { styled } from '@linaria/react';

import { ScrollWrapperInitEffect } from '@/ui/utilities/scroll/components/internal/ScrollWrapperInitEffect';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { getScrollBottomInPx } from '@/ui/utilities/scroll/utils/getScrollBottomInPx';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

const StyledScrollWrapper = styled.div<{ autoHeight?: boolean }>`
  &.scroll-wrapper-x-enabled {
    overflow-x: overlay;
  }
  &.scroll-wrapper-y-enabled {
    overflow-y: overlay;
  }
  height: ${({ autoHeight }) => (autoHeight ? 'auto' : '100%')};
  overflow-x: hidden;
  overflow-y: hidden;
  width: 100%;
`;

export type ScrollWrapperProps = {
  children: React.ReactNode;
  className?: string;
  defaultEnableXScroll?: boolean;
  defaultEnableYScroll?: boolean;
  autoHeight?: boolean;
  componentInstanceId: string;
};

export const ScrollWrapper = ({
  componentInstanceId,
  children,
  className,
  defaultEnableXScroll = true,
  defaultEnableYScroll = true,
  autoHeight = false,
}: ScrollWrapperProps) => {
  const scopedComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(componentInstanceId);

  const setScrollWrapperScrollTop = useSetAtomComponentState(
    scrollWrapperScrollTopComponentState,
    scopedComponentInstanceId,
  );

  const setScrollWrapperScrollLeft = useSetAtomComponentState(
    scrollWrapperScrollLeftComponentState,
    scopedComponentInstanceId,
  );

  const setScrollWrapperScrollBottom = useSetAtomComponentState(
    scrollWrapperScrollBottomComponentState,
    scopedComponentInstanceId,
  );

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollWrapperScrollTop(target.scrollTop);
    setScrollWrapperScrollLeft(target.scrollLeft);
    setScrollWrapperScrollBottom(getScrollBottomInPx(target));
  };

  return (
    <ScrollWrapperComponentInstanceContext.Provider
      value={{ instanceId: scopedComponentInstanceId }}
    >
      <ScrollWrapperInitEffect
        defaultEnableXScroll={defaultEnableXScroll}
        defaultEnableYScroll={defaultEnableYScroll}
      />
      <StyledScrollWrapper
        id={`scroll-wrapper-${scopedComponentInstanceId}`}
        className={className}
        autoHeight={autoHeight}
        onScroll={handleScroll}
      >
        {children}
      </StyledScrollWrapper>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
