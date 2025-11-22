import { CommandMenuRouter } from '@/command-menu/components/CommandMenuRouter';
import { COMMAND_MENU_SIDE_PANEL_WIDTH } from '@/command-menu/constants/CommandMenuSidePanelWidth';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { tableWidthResizeIsActiveState } from '@/object-record/record-table/states/tableWidthResizeIsActivedState';
import { ModalContainerContext } from '@/ui/layout/modal/contexts/ModalContainerContext';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { type ReactNode, useCallback, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useIsMobile } from 'twenty-ui/utilities';

type CommandMenuPageLayoutProps = {
  children: ReactNode;
};

const StyledLayout = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledPageBody = styled(PageBody)`
  flex: 1;
  min-width: 0;
  padding-bottom: 0;
  padding-right: 0;
`;

const StyledSidePanelWrapper = styled(motion.div)`
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;
`;

const StyledSidePanel = styled(motion.aside)`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: ${COMMAND_MENU_SIDE_PANEL_WIDTH}px;
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

export const CommandMenuPageLayout = ({
  children,
}: CommandMenuPageLayoutProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const isCommandMenuClosing = useRecoilValue(isCommandMenuClosingState);
  const { commandMenuCloseAnimationCompleteCleanup } =
    useCommandMenuCloseAnimationCompleteCleanup();
  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(
    null,
  );

  const setTableWidthResizeIsActive = useSetRecoilState(
    tableWidthResizeIsActiveState,
  );

  const [shouldRenderContent, setShouldRenderContent] =
    useState(isCommandMenuOpened);

  const shouldShowContent = isCommandMenuOpened || shouldRenderContent;

  const handleAnimationComplete = () => {
    if (!isCommandMenuOpened) {
      setShouldRenderContent(false);
    }

    if (isCommandMenuClosing) {
      commandMenuCloseAnimationCompleteCleanup();
    }

    setTableWidthResizeIsActive(true);
  };

  const handleAnimationStart = () => {
    if (isCommandMenuOpened && !shouldRenderContent) {
      setShouldRenderContent(true);
    }

    setTableWidthResizeIsActive(false);
  };

  const handleModalContainerRef = useCallback(
    (element: HTMLDivElement | null) => {
      setModalContainer(element);
    },
    [],
  );

  useCommandMenuHotKeys();

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <StyledLayout>
      <StyledPageBody>{children}</StyledPageBody>

      <StyledSidePanelWrapper
        initial={false}
        animate={{
          width: isCommandMenuOpened ? COMMAND_MENU_SIDE_PANEL_WIDTH : 0,
          marginLeft: isCommandMenuOpened ? theme.spacing(2) : 0,
        }}
        transition={{
          duration: theme.animation.duration.normal,
        }}
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationComplete}
      >
        <StyledSidePanel
          initial={false}
          animate={{
            x: isCommandMenuOpened ? 0 : COMMAND_MENU_SIDE_PANEL_WIDTH,
          }}
          transition={{
            duration: theme.animation.duration.normal,
          }}
        >
          <StyledModalContainer ref={handleModalContainerRef} />
          <ModalContainerContext.Provider value={{ container: modalContainer }}>
            {shouldShowContent && <CommandMenuRouter />}
          </ModalContainerContext.Provider>
        </StyledSidePanel>
      </StyledSidePanelWrapper>
    </StyledLayout>
  );
};
