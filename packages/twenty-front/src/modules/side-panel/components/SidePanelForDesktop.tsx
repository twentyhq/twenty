import { SidePanelRouter } from '@/side-panel/components/SidePanelRouter';
import { SidePanelWidthEffect } from '@/side-panel/components/SidePanelWidthEffect';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSidePanelCloseAnimationCompleteCleanup } from '@/side-panel/hooks/useSidePanelCloseAnimationCompleteCleanup';
import {
  SIDE_PANEL_WIDTH_VAR,
  sidePanelWidthState,
} from '@/side-panel/states/sidePanelWidthState';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { tableWidthResizeIsActiveState } from '@/object-record/record-table/states/tableWidthResizeIsActivedState';
import { ModalContainerContext } from '@/ui/layout/modal/contexts/ModalContainerContext';
import { ResizablePanelGap } from '@/ui/layout/resizable-panel/components/ResizablePanelGap';
import { SIDE_PANEL_CONSTRAINTS } from '@/side-panel/constants/SidePanelConstraints';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useCallback, useState } from 'react';
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
      : `width ${themeCssVariables.animation.duration.normal}s`};
  width: ${({ isOpen }) => (isOpen ? `var(${SIDE_PANEL_WIDTH_VAR})` : '0px')};
`;

const StyledSidePanel = styled.aside`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
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

const GAP_WIDTH = 8;

export const SidePanelForDesktop = () => {
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const isSidePanelClosing = useAtomStateValue(isSidePanelClosingState);
  const [sidePanelWidth, setSidePanelWidth] = useAtomState(sidePanelWidthState);
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { sidePanelCloseAnimationCompleteCleanup } =
    useSidePanelCloseAnimationCompleteCleanup();

  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const [isResizing, setIsResizing] = useState(false);
  const [shouldRenderContent, setShouldRenderContent] =
    useState(isSidePanelOpened);

  const setTableWidthResizeIsActive = useSetAtomState(
    tableWidthResizeIsActiveState,
  );

  const shouldShowContent = isSidePanelOpened || shouldRenderContent;

  const handleTransitionEnd = () => {
    if (isSidePanelOpened) {
      // Open animation completed - ensure content persists for close animation
      setShouldRenderContent(true);
    } else {
      // Close animation completed
      setShouldRenderContent(false);
      if (isSidePanelClosing) {
        sidePanelCloseAnimationCompleteCleanup();
      }
    }
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
        gapWidth={isSidePanelOpened ? GAP_WIDTH : 0}
        cssVariableName={SIDE_PANEL_WIDTH_VAR}
        onResizeStart={handleResizeStart}
      />

      <StyledSidePanelWrapper
        isOpen={isSidePanelOpened}
        isResizing={isResizing}
        onTransitionEnd={handleTransitionEnd}
        data-side-panel=""
      >
        <StyledSidePanel>
          <StyledModalContainer ref={handleModalContainerRef} />
          <ModalContainerContext.Provider value={{ container: modalContainer }}>
            {shouldShowContent && <SidePanelRouter />}
          </ModalContainerContext.Provider>
        </StyledSidePanel>
      </StyledSidePanelWrapper>
    </>
  );
};
