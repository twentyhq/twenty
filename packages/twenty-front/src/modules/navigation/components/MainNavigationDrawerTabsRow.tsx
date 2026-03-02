import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  IconComment,
  IconHome,
  IconMessageCirclePlus,
} from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';

import { useCreateNewAIChatThread } from '@/ai/hooks/useCreateNewAIChatThread';
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
  justify-content: ${({ isExpanded }) =>
    isExpanded ? 'space-between' : 'center'};
  gap: ${({ theme, isExpanded }) => (isExpanded ? theme.spacing(2) : 0)};
  width: 100%;
  transition: gap ${({ theme }) => theme.animation.duration.normal}s ease;
`;

const StyledTabsPill = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  padding: 3px;
  height: ${({ theme }) => theme.spacing(7)};
  display: flex;
  width: ${({ theme }) => theme.spacing(18)};
  gap: ${({ theme }) => theme.spacing(0.5)};
  box-sizing: border-box;
`;

const StyledTabWrapper = styled.div<{ isActive: boolean }>`
  border-radius: ${({ theme }) => theme.border.radius.pill};
  align-items: center;
  background: ${({ theme, isActive }) =>
    isActive ? theme.background.transparent.light : 'transparent'};
  color: ${({ theme, isActive }) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  justify-content: center;
  height: 100%;
  flex: 1;

  &:hover {
    background: ${({ theme, isActive }) =>
      isActive
        ? theme.background.transparent.light
        : theme.background.transparent.lighter};
  }
`;

const StyledTabIcon = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  height: ${({ theme }) => theme.spacing(5)};
  width: ${({ theme }) => theme.spacing(5)};
`;

const StyledNewChatButtonWrapper = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  box-sizing: border-box;
  display: flex;
  height: ${({ theme, isExpanded }) =>
    isExpanded ? theme.spacing(7) : theme.spacing(6)};
  justify-content: center;
  padding: ${({ theme, isExpanded }) =>
    isExpanded ? '3px' : theme.spacing(0.5)};
  width: ${({ theme, isExpanded }) =>
    isExpanded ? theme.spacing(25.75) : theme.spacing(6)};
  transition:
    height ${({ theme }) => theme.animation.duration.normal}s ease,
    padding ${({ theme }) => theme.animation.duration.normal}s ease;
`;

const StyledNewChatButton = styled.div`
  align-items: center;
  justify-content: center;
  display: flex;
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 100%;
  width: 100%;
  border-radius: inherit;
  color: ${({ theme }) => theme.font.color.secondary};
  transition:
    background ${({ theme }) => theme.animation.duration.fast}s ease,
    color ${({ theme }) => theme.animation.duration.fast}s ease;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

export const MainNavigationDrawerTabsRow = () => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const [navigationDrawerActiveTab, setNavigationDrawerActiveTab] =
    useAtomState(navigationDrawerActiveTabState);
  const { createChatThread } = useCreateNewAIChatThread();
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
    createChatThread();
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
