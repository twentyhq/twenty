import { CommandMenuRouter } from '@/command-menu/components/CommandMenuRouter';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { type ReactNode, useState } from 'react';
import { useRecoilValue } from 'recoil';

type RecordPageSidePanelLayoutProps = {
  children: ReactNode;
  isSidePanelOpen?: boolean;
};

const DEFAULT_SIDE_PANEL_WIDTH = 400;
const DEFAULT_LAYOUT_PADDING_RIGHT = 16;
const DEFAULT_LAYOUT_PADDING_BOTTOM = 12;

const StyledLayout = styled.div<{
  paddingBottom: number;
  paddingRight: number;
}>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  padding-bottom: ${({ paddingBottom }) => `${paddingBottom}px`};
  padding-right: 0;
  width: 100%;
`;

const StyledPageBody = styled(PageBody)<{
  isSidePanelOpen: boolean;
  paddingRight: number;
  sidePanelWidth: number;
}>`
  padding-bottom: 0;
  padding-right: 0;
  max-width: ${({ isSidePanelOpen, paddingRight, sidePanelWidth }) =>
    isSidePanelOpen
      ? `calc(100% - ${sidePanelWidth + paddingRight}px)`
      : `calc(100% - ${paddingRight}px)`};
  transition: max-width ${({ theme }) => theme.animation.duration.normal}s;
`;

const StyledSidePanel = styled(motion.aside)`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const RecordPageSidePanelLayout = ({
  children,
  isSidePanelOpen,
}: RecordPageSidePanelLayoutProps) => {
  const theme = useTheme();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  const resolvedIsSidePanelOpen =
    isSidePanelOpen ?? isCommandMenuOpened ?? false;

  const [shouldRenderContent, setShouldRenderContent] = useState(
    resolvedIsSidePanelOpen,
  );

  const shouldShowContent = resolvedIsSidePanelOpen || shouldRenderContent;

  if (resolvedIsSidePanelOpen && !shouldRenderContent) {
    setShouldRenderContent(true);
  }

  const handleAnimationComplete = () => {
    if (!resolvedIsSidePanelOpen) {
      setShouldRenderContent(false);
    }
  };

  return (
    <StyledLayout
      paddingBottom={DEFAULT_LAYOUT_PADDING_BOTTOM}
      paddingRight={DEFAULT_LAYOUT_PADDING_RIGHT}
    >
      <StyledPageBody
        isSidePanelOpen={resolvedIsSidePanelOpen}
        paddingRight={DEFAULT_LAYOUT_PADDING_RIGHT}
        sidePanelWidth={DEFAULT_SIDE_PANEL_WIDTH}
      >
        {children}
      </StyledPageBody>

      <StyledSidePanel
        initial={false}
        animate={{
          width: resolvedIsSidePanelOpen ? DEFAULT_SIDE_PANEL_WIDTH : 0,
        }}
        transition={{
          duration: theme.animation.duration.normal,
        }}
        onAnimationComplete={handleAnimationComplete}
      >
        {shouldShowContent && <CommandMenuRouter />}
      </StyledSidePanel>
    </StyledLayout>
  );
};
