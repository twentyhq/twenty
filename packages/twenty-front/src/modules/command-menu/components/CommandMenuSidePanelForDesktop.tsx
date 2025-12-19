import { CommandMenuRouter } from '@/command-menu/components/CommandMenuRouter';
import { CommandMenuWidthEffect } from '@/command-menu/components/CommandMenuWidthEffect';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import {
  COMMAND_MENU_WIDTH_VAR,
  commandMenuWidthState,
} from '@/command-menu/states/commandMenuWidthState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { tableWidthResizeIsActiveState } from '@/object-record/record-table/states/tableWidthResizeIsActivedState';
import { ModalContainerContext } from '@/ui/layout/modal/contexts/ModalContainerContext';
import { ResizablePanelGap } from '@/ui/layout/resizable-panel/components/ResizablePanelGap';
import { COMMAND_MENU_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/CommandMenuConstraints';
import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

const StyledSidePanelWrapper = styled.div<{
  isOpen: boolean;
  isResizing: boolean;
}>`
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;
  width: ${({ isOpen }) => (isOpen ? `var(${COMMAND_MENU_WIDTH_VAR})` : '0px')};
  transition: ${({ isResizing, theme }) =>
    isResizing ? 'none' : `width ${theme.animation.duration.normal}s`};
`;

const StyledSidePanel = styled.aside`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
  box-sizing: border-box;
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

export const CommandMenuSidePanelForDesktop = () => {
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const isCommandMenuClosing = useRecoilValue(isCommandMenuClosingState);
  const [commandMenuWidth, setCommandMenuWidth] = useRecoilState(
    commandMenuWidthState,
  );
  const { closeCommandMenu } = useCommandMenu();
  const { commandMenuCloseAnimationCompleteCleanup } =
    useCommandMenuCloseAnimationCompleteCleanup();

  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const [isResizing, setIsResizing] = useState(false);
  const [shouldRenderContent, setShouldRenderContent] =
    useState(isCommandMenuOpened);

  const setTableWidthResizeIsActive = useSetRecoilState(
    tableWidthResizeIsActiveState,
  );

  const shouldShowContent = isCommandMenuOpened || shouldRenderContent;

  const handleTransitionEnd = () => {
    if (isCommandMenuOpened) {
      // Open animation completed - ensure content persists for close animation
      setShouldRenderContent(true);
    } else {
      // Close animation completed
      setShouldRenderContent(false);
      if (isCommandMenuClosing) {
        commandMenuCloseAnimationCompleteCleanup();
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
      setCommandMenuWidth(width);
      setIsResizing(false);
      setTableWidthResizeIsActive(true);
    },
    [setCommandMenuWidth, setTableWidthResizeIsActive],
  );

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
    setTableWidthResizeIsActive(false);
  }, [setTableWidthResizeIsActive]);

  const handleCollapse = useCallback(() => {
    closeCommandMenu();
    setIsResizing(false);
    setTableWidthResizeIsActive(true);
  }, [closeCommandMenu, setTableWidthResizeIsActive]);

  return (
    <>
      <CommandMenuWidthEffect />
      <ResizablePanelGap
        side="left"
        constraints={COMMAND_MENU_CONSTRAINTS}
        currentWidth={commandMenuWidth}
        onWidthChange={handleWidthChange}
        onCollapse={handleCollapse}
        gapWidth={isCommandMenuOpened ? GAP_WIDTH : 0}
        cssVariableName={COMMAND_MENU_WIDTH_VAR}
        onResizeStart={handleResizeStart}
      />

      <StyledSidePanelWrapper
        isOpen={isCommandMenuOpened}
        isResizing={isResizing}
        onTransitionEnd={handleTransitionEnd}
      >
        <StyledSidePanel>
          <StyledModalContainer ref={handleModalContainerRef} />
          <ModalContainerContext.Provider value={{ container: modalContainer }}>
            {shouldShowContent && <CommandMenuRouter />}
          </ModalContainerContext.Provider>
        </StyledSidePanel>
      </StyledSidePanelWrapper>
    </>
  );
};
