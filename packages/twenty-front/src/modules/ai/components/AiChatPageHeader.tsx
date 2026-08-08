import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconEdit, IconHistory, IconSparkles } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
import { v4 } from 'uuid';

import { AiChatCollapseButton } from '@/ai/components/AiChatCollapseButton';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SIDE_PANEL_TOP_BAR_HEIGHT } from '@/side-panel/constants/SidePanelTopBarHeight';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';

const StyledHeader = styled.header`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing['0.5']};
  height: ${SIDE_PANEL_TOP_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledHeaderTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AiChatPageHeader = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const { switchToNewChat } = useSwitchToNewAiChat();

  const handleOpenPreviousChats = () => {
    navigateSidePanelMenu({
      page: SidePanelPages.ViewPreviousAiChats,
      pageTitle: t`View Previous AI Chats`,
      pageIcon: IconHistory,
      pageId: v4(),
      resetNavigationStack: true,
    });
  };

  return (
    <StyledHeader>
      {!isNavigationDrawerExpanded && !isMobile && (
        <NavigationDrawerCollapseButton direction="right" />
      )}
      <StyledHeaderTitle>
        <IconSparkles size={theme.icon.size.md} />
        {t`Ask AI`}
      </StyledHeaderTitle>
      <IconButton
        Icon={IconHistory}
        size="small"
        variant="tertiary"
        onClick={handleOpenPreviousChats}
        ariaLabel={t`View Previous AI Chats`}
      />
      <IconButton
        Icon={IconEdit}
        size="small"
        variant="tertiary"
        onClick={() => switchToNewChat()}
        ariaLabel={t`New conversation`}
      />
      <AiChatCollapseButton />
    </StyledHeader>
  );
};
