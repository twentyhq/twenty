import { tableWidthResizeIsActiveState } from '@/object-record/record-table/states/tableWidthResizeIsActivedState';
import { SidePanelRouter } from '@/side-panel/components/SidePanelRouter';
import { SidePanelWidthEffect } from '@/side-panel/components/SidePanelWidthEffect';
import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { SIDE_PANEL_CONSTRAINTS } from '@/side-panel/constants/SidePanelConstraints';
import { useAskAiHandoffFromWorkspaceSetup } from '@/side-panel/hooks/useAskAiHandoffFromWorkspaceSetup';
import { useSidePanelCloseAnimationCompleteCleanup } from '@/side-panel/hooks/useSidePanelCloseAnimationCompleteCleanup';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  SIDE_PANEL_WIDTH_VAR,
  sidePanelWidthState,
} from '@/side-panel/states/sidePanelWidthState';
import { ModalContainerContext } from '@/ui/layout/modal/contexts/ModalContainerContext';
import { ResizablePanelGap } from '@/ui/layout/resizable-panel/components/ResizablePanelGap';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { type AnimationEvent, useCallback, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSidePanelWrapper = styled.div<{
  isOpen: boolean;
  isResizing: boolean;
}>`
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;
  transition: ${({ isResizing }) =>
    isResizing
      ? 'none'
      : `width calc(${themeCssVariables.animation.duration.normal} * 1s)`};
  width: ${({ isOpen }) => (isOpen ? `var(${SIDE_PANEL_WIDTH_VAR})` : '0px')};

  @keyframes sidePanelShrinkFromFullWidth {
    from {
      width: 100%;
    }
  }

  &[data-shrink-from-full-width='true'] {
    animation: sidePanelShrinkFromFullWidth
      calc(${themeCssVariables.animation.duration.normal} * 1s);
  }
`;

const StyledSidePanel = styled.aside<{ isShrinkingFromFullWidth: boolean }>`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: ${({ isShrinkingFromFullWidth }) =>
    isShrinkingFromFullWidth ? '100%' : `var(${SIDE_PANEL_WIDTH_VAR})`};
`;

const StyledModalContainer = styled.div`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
`;

export const SidePanelForDesktop = () => {
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const isSidePanelClosing = useAtomStateValue(isSidePanelClosingState);
  const [sidePanelWidth, setSidePanelWidth] = useAtomState(sidePanelWidthState);
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { sidePanelCloseAnimationCompleteCleanup } =
    useSidePanelCloseAnimationCompleteCleanup();
  const { shouldShrinkFromFullWidth } = useAskAiHandoffFromWorkspaceSetup();

  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const [isResizing, setIsResizing] = useState(false);
  const [shouldRenderContent, setShouldRenderContent] =
    useState(isSidePanelOpened);
  const [isShrinkingFromFullWidth, setIsShrinkingFromFullWidth] = useState(
    shouldShrinkFromFullWidth,
  );

  const setTableWidthResizeIsActive = useSetAtomState(
    tableWidthResizeIsActiveState,
  );

  const shouldShowContent = isSidePanelOpened || shouldRenderContent;

  // The panel finishes opening through the width transition or the handoff
  // entrance animation, so content persistence keys off the open state itself
  // rather than one of those two completion events.
  if (isSidePanelOpened && !shouldRenderContent) {
    setShouldRenderContent(true);
  }

  const handleTransitionEnd = () => {
    if (isSidePanelOpened) {
      return;
    }

    // Close animation completed
    setShouldRenderContent(false);
    if (isSidePanelClosing) {
      sidePanelCloseAnimationCompleteCleanup();
    }
  };

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    setIsShrinkingFromFullWidth(false);

    // The entrance animation owns the width while it runs, so a close started
    // during it never produces a transition to complete the close lifecycle.
    handleTransitionEnd();
  };

  const handleModalContainerRef = useCallback(
    (element: HTMLDivElement | null) => {
      setModalContainer(element);
    },
    [],
  );

  const handleWidthChange = useCallback(
    (width: number) => {
      setSidePanelWidth(width);
      setIsResizing(false);
      setTableWidthResizeIsActive(true);
    },
    [setSidePanelWidth, setTableWidthResizeIsActive],
  );

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
    setTableWidthResizeIsActive(false);
  }, [setTableWidthResizeIsActive]);

  const handleCollapse = useCallback(() => {
    closeSidePanelMenu();
    setIsResizing(false);
    setTableWidthResizeIsActive(true);
  }, [closeSidePanelMenu, setTableWidthResizeIsActive]);

  return (
    <>
      <SidePanelWidthEffect />
      <ResizablePanelGap
        side="left"
        constraints={SIDE_PANEL_CONSTRAINTS}
        currentWidth={sidePanelWidth}
        onWidthChange={handleWidthChange}
        onCollapse={handleCollapse}
        gapWidth={0}
        cssVariableName={SIDE_PANEL_WIDTH_VAR}
        onResizeStart={handleResizeStart}
      />

      <StyledSidePanelWrapper
        isOpen={isSidePanelOpened}
        isResizing={isResizing}
        onTransitionEnd={handleTransitionEnd}
        onAnimationEnd={handleAnimationEnd}
        data-shrink-from-full-width={isShrinkingFromFullWidth}
        data-side-panel=""
        data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}
      >
        <StyledSidePanel isShrinkingFromFullWidth={isShrinkingFromFullWidth}>
          <StyledModalContainer ref={handleModalContainerRef} />
          <ModalContainerContext.Provider value={{ container: modalContainer }}>
            <ParentClickOutsideIdContext.Provider
              value={SIDE_PANEL_CLICK_OUTSIDE_ID}
            >
              {shouldShowContent && <SidePanelRouter />}
            </ParentClickOutsideIdContext.Provider>
          </ModalContainerContext.Provider>
        </StyledSidePanel>
      </StyledSidePanelWrapper>
    </>
  );
};
