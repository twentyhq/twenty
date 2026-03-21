import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconComment,
  IconHome,
  IconMessageCirclePlus,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { useContext } from 'react';

import { useSwitchToNewAIChat } from '@/ai/hooks/useSwitchToNewAIChat';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledRow = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  gap: ${({ isExpanded }) => (isExpanded ? themeCssVariables.spacing[2] : 0)};
  justify-content: ${({ isExpanded }) =>
    isExpanded ? 'space-between' : 'center'};
  transition: gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  width: 100%;
`;

const StyledTabsPill = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
  height: ${themeCssVariables.spacing[7]};
  padding: 3px;
  width: ${themeCssVariables.spacing[18]};
`;

const StyledTabWrapper = styled.div<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.light : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;

  &:hover {
    background: ${({ isActive }) =>
      isActive
        ? themeCssVariables.background.transparent.light
        : themeCssVariables.background.transparent.lighter};
  }
`;

const StyledTabIcon = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[5]};
  justify-content: center;
  width: ${themeCssVariables.spacing[5]};
`;

const StyledNewChatButtonWrapper = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  display: flex;
  height: ${({ isExpanded }) =>
    isExpanded ? themeCssVariables.spacing[7] : themeCssVariables.spacing[6]};
  justify-content: center;
  padding: ${({ isExpanded }) =>
    isExpanded ? '3px' : themeCssVariables.spacing[0.5]};
  transition:
    height calc(${themeCssVariables.animation.duration.normal} * 1s) ease,
    padding calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ isExpanded }) =>
    isExpanded ? '103px' : themeCssVariables.spacing[6]};
`;

const StyledNewChatButton = styled.div`
  align-items: center;
  border-radius: inherit;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  justify-content: center;
  transition:
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    color calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

export const MainNavigationDrawerTabsRow = () => {
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const [navigationDrawerActiveTab, setNavigationDrawerActiveTab] =
    useAtomState(navigationDrawerActiveTabState);
  const { switchToNewChat } = useSwitchToNewAIChat();
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );

  if (!isAiEnabled) {
    return null;
  }

  const isExpanded = isNavigationDrawerExpanded || isMobile;

  const handleTabClick = (tab: NavigationDrawerActiveTab) => () => {
    setNavigationDrawerActiveTab(tab);
  };

  const handleTabKeyDown =
    (tab: NavigationDrawerActiveTab) => (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setNavigationDrawerActiveTab(tab);
      }
    };

  const handleNewChatClick = () => {
    if (isMobile) {
      setIsNavigationDrawerExpanded(false);
    }
    switchToNewChat();
  };

  const handleNewChatKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNewChatClick();
    }
  };

  const getTabIconColor = (isActive: boolean) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary;

  return (
    <StyledRow isExpanded={isExpanded}>
      <NavigationDrawerAnimatedCollapseWrapper>
        <StyledTabsPill role="tablist" aria-label={t`Navigation tabs`}>
          <StyledTabWrapper
            isActive={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
            }
            role="tab"
            aria-selected={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
            }
            aria-label={t`Home`}
            tabIndex={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
                ? 0
                : -1
            }
            onClick={handleTabClick(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU)}
            onKeyDown={handleTabKeyDown(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU)}
          >
            <StyledTabIcon>
              <IconHome
                size={theme.icon.size.sm}
                color={getTabIconColor(
                  navigationDrawerActiveTab ===
                    NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
                )}
              />
            </StyledTabIcon>
          </StyledTabWrapper>
          <StyledTabWrapper
            isActive={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY
            }
            role="tab"
            aria-selected={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY
            }
            aria-label={t`Chat`}
            tabIndex={
              navigationDrawerActiveTab ===
              NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY
                ? 0
                : -1
            }
            onClick={handleTabClick(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY)}
            onKeyDown={handleTabKeyDown(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY)}
          >
            <StyledTabIcon>
              <IconComment
                size={theme.icon.size.sm}
                color={getTabIconColor(
                  navigationDrawerActiveTab ===
                    NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
                )}
              />
            </StyledTabIcon>
          </StyledTabWrapper>
        </StyledTabsPill>
      </NavigationDrawerAnimatedCollapseWrapper>
      <StyledNewChatButtonWrapper isExpanded={isExpanded}>
        <StyledNewChatButton
          role="button"
          tabIndex={0}
          aria-label={t`New chat`}
          onClick={handleNewChatClick}
          onKeyDown={handleNewChatKeyDown}
        >
          <IconMessageCirclePlus size={theme.icon.size.md} />
          {isExpanded && t`New chat`}
        </StyledNewChatButton>
      </StyledNewChatButtonWrapper>
    </StyledRow>
  );
};
