import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconHierarchy2,
  IconHome,
  IconInbox,
} from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { useOpenExpandedAiChat } from '@/ai/expanded-chat/hooks/useOpenExpandedAiChat';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useInboxNotifications } from '@/notification/hooks/useInboxNotifications';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledToggleRow = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
  padding: 3px;
  width: 100%;
`;

const StyledUnreadBadge = styled.span`
  background: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.inverted};
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 14px;
  min-width: 14px;
  padding: 0 3px;
  text-align: center;
`;

const StyledSegment = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.light : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex: 1;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  padding: 0;

  &:hover {
    background: ${({ isActive }) =>
      isActive
        ? themeCssVariables.background.transparent.light
        : themeCssVariables.background.transparent.lighter};
  }
`;

type NavigationMode = 'inbox' | 'app' | 'studio';

type NavigationModeSegment = {
  mode: NavigationMode;
  label: string;
  Icon: IconComponent;
};

export const NavigationModeToggle = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const store = useStore();
  const navigate = useNavigate();
  const isSettingsPage = useIsSettingsPage();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { openExpandedAiChat, isOnExpandedAiChatPage } =
    useOpenExpandedAiChat();
  const { openSettingsMenu } = useOpenSettingsMenu();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { unreadCount } = useInboxNotifications();

  const activeMode: NavigationMode = isOnExpandedAiChatPage
    ? 'inbox'
    : isSettingsPage
      ? 'studio'
      : 'app';

  // Both memorized locations can point at another non-app mode when the
  // user hopped between Inbox and Studio directly; the App segment must
  // always land on an app page.
  const isAppLocation = (
    candidateLocation: string | null,
  ): candidateLocation is string =>
    isNonEmptyString(candidateLocation) &&
    !candidateLocation.startsWith('/settings') &&
    !candidateLocation.startsWith(AppPath.AiChat);

  const navigateToApp = () => {
    if (activeMode === 'studio') {
      const memorizedUrl = store.get(navigationMemorizedUrlState.atom);
      store.set(currentMobileNavigationDrawerState.atom, 'main');
      store.set(
        isNavigationDrawerExpandedState.atom,
        store.get(navigationDrawerExpandedMemorizedState.atom),
      );
      navigate(
        isAppLocation(memorizedUrl) ? memorizedUrl : defaultHomePagePath,
      );
      return;
    }

    const returnLocation = store.get(aiChatExpandedReturnLocationState.atom);
    store.set(aiChatExpandedReturnLocationState.atom, null);
    navigate(
      isAppLocation(returnLocation) ? returnLocation : defaultHomePagePath,
    );
  };

  const handleSegmentClick = (mode: NavigationMode) => {
    if (mode === activeMode) {
      return;
    }

    if (mode === 'inbox') {
      openExpandedAiChat();
      return;
    }

    if (mode === 'studio') {
      openSettingsMenu();
      navigate(getSettingsPath(SettingsPath.Objects));
      return;
    }

    navigateToApp();
  };

  const segments: NavigationModeSegment[] = [
    ...(hasAiPermission
      ? [{ mode: 'inbox' as const, label: t`Inbox`, Icon: IconInbox }]
      : []),
    { mode: 'app' as const, label: t`App`, Icon: IconHome },
    { mode: 'studio' as const, label: t`Studio`, Icon: IconHierarchy2 },
  ];

  return (
    <NavigationDrawerAnimatedCollapseWrapper>
      <StyledToggleRow role="tablist" aria-label={t`Workspace mode`}>
        {segments.map(({ mode, label, Icon }) => (
          <StyledSegment
            key={mode}
            isActive={activeMode === mode}
            role="tab"
            aria-selected={activeMode === mode}
            onClick={() => handleSegmentClick(mode)}
          >
            <Icon size={theme.icon.size.sm} />
            {label}
            {mode === 'inbox' && unreadCount > 0 && (
              <StyledUnreadBadge>
                {unreadCount > 9 ? '9+' : unreadCount}
              </StyledUnreadBadge>
            )}
          </StyledSegment>
        ))}
      </StyledToggleRow>
    </NavigationDrawerAnimatedCollapseWrapper>
  );
};
