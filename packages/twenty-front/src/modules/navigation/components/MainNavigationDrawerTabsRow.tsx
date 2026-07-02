import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  type IconComponent,
  IconComment,
  IconHome,
  IconMessageCirclePlus,
} from 'twenty-ui/icon';
import { SegmentedControl, type SegmentedControlOption } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { useContext } from 'react';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
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
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledRow = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  gap: ${({ isExpanded }) => (isExpanded ? themeCssVariables.spacing[2] : 0)};
  justify-content: ${({ isExpanded }) =>
    isExpanded ? 'space-between' : 'center'};
  transition: gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ isExpanded }) => (isExpanded ? '100%' : 'max-content')};
`;

const StyledNewChatIcon = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  justify-content: center;
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
  min-width: 0;
  overflow: hidden;
  padding-inline: ${themeCssVariables.spacing[2]};
  transition:
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    color calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }
`;

type MainNavigationDrawerTabsRowProps = {
  NavigationMenuTabIcon?: IconComponent;
  forceExpanded?: boolean;
  navigationMenuTabLabel?: string;
};

export const MainNavigationDrawerTabsRow = ({
  forceExpanded = false,
  NavigationMenuTabIcon = IconHome,
  navigationMenuTabLabel = t`Home`,
}: MainNavigationDrawerTabsRowProps) => {
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const [navigationDrawerActiveTab, setNavigationDrawerActiveTab] =
    useAtomState(navigationDrawerActiveTabState);
  const { switchToNewChat } = useSwitchToNewAiChat();
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const isExpanded = forceExpanded || isNavigationDrawerExpanded || isMobile;

  if (!hasAiPermission) {
    return null;
  }

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

  const navigationTabOptions = [
    {
      Icon: NavigationMenuTabIcon,
      ariaLabel: navigationMenuTabLabel,
      value: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    },
    {
      Icon: IconComment,
      ariaLabel: t`Chat`,
      value: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    },
  ] satisfies SegmentedControlOption<NavigationDrawerActiveTab>[];

  return (
    <StyledRow isExpanded={isExpanded}>
      <NavigationDrawerAnimatedCollapseWrapper>
        <SegmentedControl
          ariaLabel={t`Navigation tabs`}
          onChange={setNavigationDrawerActiveTab}
          options={navigationTabOptions}
          role="tablist"
          value={navigationDrawerActiveTab}
          width={themeCssVariables.spacing[18]}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      <StyledNewChatButtonWrapper isExpanded={isExpanded}>
        <StyledNewChatButton
          role="button"
          tabIndex={0}
          aria-label={t`New chat`}
          onClick={handleNewChatClick}
          onKeyDown={handleNewChatKeyDown}
        >
          <StyledNewChatIcon>
            <IconMessageCirclePlus size={theme.icon.size.md} />
          </StyledNewChatIcon>
          {isExpanded && <OverflowingTextWithTooltip text={t`New chat`} />}
        </StyledNewChatButton>
      </StyledNewChatButtonWrapper>
    </StyledRow>
  );
};
