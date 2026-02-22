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
import {
  type NavigationDrawerActiveTab,
  navigationDrawerActiveTabState,
} from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTabsPill = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  padding: ${({ theme }) => theme.spacing(0.75)};
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

const StyledNewChatButtonWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  height: ${({ theme }) => theme.spacing(7)};
  padding: ${({ theme }) => theme.spacing(0.75)};
  width: ${({ theme }) => theme.spacing(25.75)};
  box-sizing: border-box;
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
  const [activeTab, setActiveTab] = useRecoilStateV2(
    navigationDrawerActiveTabState,
  );
  const { createChatThread } = useCreateNewAIChatThread();
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  if (isMobile || !isAiEnabled) {
    return null;
  }

  const handleTabClick = (tab: NavigationDrawerActiveTab) => () => {
    setActiveTab(tab);
  };

  const handleTabKeyDown =
    (tab: NavigationDrawerActiveTab) => (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActiveTab(tab);
      }
    };

  const handleNewChatKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      createChatThread();
    }
  };

  const getTabIconColor = (isActive: boolean) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary;

  return (
    <StyledRow>
      <StyledTabsPill role="tablist" aria-label={t`Navigation tabs`}>
        <StyledTabWrapper
          isActive={activeTab === 'home'}
          role="tab"
          aria-selected={activeTab === 'home'}
          aria-label={t`Home`}
          tabIndex={activeTab === 'home' ? 0 : -1}
          onClick={handleTabClick('home')}
          onKeyDown={handleTabKeyDown('home')}
        >
          <StyledTabIcon>
            <IconHome
              size={theme.icon.size.sm}
              color={getTabIconColor(activeTab === 'home')}
            />
          </StyledTabIcon>
        </StyledTabWrapper>
        <StyledTabWrapper
          isActive={activeTab === 'chat'}
          role="tab"
          aria-selected={activeTab === 'chat'}
          aria-label={t`Chat`}
          tabIndex={activeTab === 'chat' ? 0 : -1}
          onClick={handleTabClick('chat')}
          onKeyDown={handleTabKeyDown('chat')}
        >
          <StyledTabIcon>
            <IconComment
              size={theme.icon.size.sm}
              color={getTabIconColor(activeTab === 'chat')}
            />
          </StyledTabIcon>
        </StyledTabWrapper>
      </StyledTabsPill>
      <StyledNewChatButtonWrapper>
        <StyledNewChatButton
          role="button"
          tabIndex={0}
          aria-label={t`New chat`}
          onClick={() => createChatThread()}
          onKeyDown={handleNewChatKeyDown}
        >
          <IconMessageCirclePlus size={theme.icon.size.md} />
          {t`New chat`}
        </StyledNewChatButton>
      </StyledNewChatButtonWrapper>
    </StyledRow>
  );
};
