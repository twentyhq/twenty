import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import {
  type IconComponent,
  IconComment,
  IconHome,
  IconSettings,
} from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledPill = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  corner-shape: round;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
  height: ${themeCssVariables.spacing[8]};
  max-width: 100%;
  padding: 3px;
  width: max-content;
`;

const StyledTab = styled.div<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.light : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  justify-content: center;
  padding-inline: ${({ isActive }) =>
    isActive ? themeCssVariables.spacing[3] : themeCssVariables.spacing[2]};
  white-space: nowrap;

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
  flex-shrink: 0;
  justify-content: center;
`;

export const MobileHomeTabsRow = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const [navigationDrawerActiveTab, setNavigationDrawerActiveTab] =
    useAtomState(navigationDrawerActiveTabState);
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const tabs: {
    tab: NavigationDrawerActiveTab;
    label: string;
    Icon: IconComponent;
  }[] = [
    {
      tab: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      label: t`Home`,
      Icon: IconHome,
    },
    ...(hasAiPermission
      ? [
          {
            tab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
            label: t`Chat`,
            Icon: IconComment,
          },
        ]
      : []),
    {
      tab: NAVIGATION_DRAWER_TABS.SETTINGS,
      label: t`Settings`,
      Icon: IconSettings,
    },
  ];

  const handleTabKeyDown =
    (tab: NavigationDrawerActiveTab) => (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setNavigationDrawerActiveTab(tab);
      }
    };

  return (
    <StyledPill role="tablist" aria-label={t`Navigation tabs`}>
      {tabs.map(({ tab, label, Icon }) => {
        const isActive = navigationDrawerActiveTab === tab;

        return (
          <StyledTab
            key={tab}
            isActive={isActive}
            role="tab"
            aria-selected={isActive}
            aria-label={label}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setNavigationDrawerActiveTab(tab)}
            onKeyDown={handleTabKeyDown(tab)}
          >
            <StyledTabIcon>
              <Icon
                size={theme.icon.size.md}
                color={
                  isActive
                    ? theme.font.color.primary
                    : theme.font.color.tertiary
                }
              />
            </StyledTabIcon>
            {isActive && label}
          </StyledTab>
        );
      })}
    </StyledPill>
  );
};
