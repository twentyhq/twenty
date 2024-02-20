import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { useSettingsNavItem } from '@/settings/hooks/useSettingsNavItem';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import {
  IconApps,
  IconAt,
  IconCalendarEvent,
  IconColorSwatch,
  IconDoorEnter,
  IconHierarchy2,
  IconMail,
  IconRobot,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from '@/ui/display/icon';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const SettingsNavigationDrawerItems = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = useCallback(() => {
    signOut();
    navigate(AppPath.SignIn);
  }, [signOut, navigate]);

  const isCalendarEnabled = useIsFeatureEnabled('IS_CALENDAR_ENABLED');
  const isMessagingEnabled = useIsFeatureEnabled('IS_MESSAGING_ENABLED');

  const profileNavItem = useSettingsNavItem({ path: SettingsPath.ProfilePage });
  const appearanceNavItem = useSettingsNavItem({
    path: SettingsPath.Appearance,
  });
  const accountsNavItem = useSettingsNavItem({ path: SettingsPath.Accounts });
  const accountsEmailsNavItem = useSettingsNavItem({
    path: SettingsPath.AccountsEmails,
    matchSubPages: true,
  });
  const accountsCalendarsNavItem = useSettingsNavItem({
    path: SettingsPath.AccountsCalendars,
    matchSubPages: true,
  });
  const workspaceNavItem = useSettingsNavItem({ path: SettingsPath.Workspace });
  const workspaceMembersNavItem = useSettingsNavItem({
    path: SettingsPath.WorkspaceMembersPage,
  });
  const dataModelNavItem = useSettingsNavItem({
    path: SettingsPath.Objects,
    matchSubPages: true,
  });
  const developersNavItem = useSettingsNavItem({
    path: SettingsPath.Developers,
  });
  const integrationsNavItem = useSettingsNavItem({
    path: SettingsPath.Integrations,
  });

  return (
    <>
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="User" />
        <NavigationDrawerItem
          label="Profile"
          to={profileNavItem.to}
          Icon={IconUserCircle}
          active={profileNavItem.isActive}
        />
        <NavigationDrawerItem
          label="Appearance"
          to={appearanceNavItem.to}
          Icon={IconColorSwatch}
          active={appearanceNavItem.isActive}
        />
        {isMessagingEnabled && (
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Accounts"
              to={accountsNavItem.to}
              Icon={IconAt}
              active={accountsNavItem.isActive}
            />
            <NavigationDrawerItem
              level={2}
              label="Emails"
              to={accountsEmailsNavItem.to}
              Icon={IconMail}
              active={accountsEmailsNavItem.isActive}
            />
            <NavigationDrawerItem
              level={2}
              label="Calendars"
              to={accountsCalendarsNavItem.to}
              Icon={IconCalendarEvent}
              active={accountsCalendarsNavItem.isActive}
              soon={!isCalendarEnabled}
            />
          </NavigationDrawerItemGroup>
        )}
      </NavigationDrawerSection>

      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Workspace" />
        <NavigationDrawerItem
          label="General"
          to={workspaceNavItem.to}
          Icon={IconSettings}
          active={workspaceNavItem.isActive}
        />
        <NavigationDrawerItem
          label="Members"
          to={workspaceMembersNavItem.to}
          Icon={IconUsers}
          active={workspaceMembersNavItem.isActive}
        />
        <NavigationDrawerItem
          label="Data model"
          to={dataModelNavItem.to}
          Icon={IconHierarchy2}
          active={dataModelNavItem.isActive}
        />
        <NavigationDrawerItem
          label="Developers"
          to={developersNavItem.to}
          Icon={IconRobot}
          active={developersNavItem.isActive}
        />
        <NavigationDrawerItem
          label="Integrations"
          to={integrationsNavItem.to}
          Icon={IconApps}
          active={integrationsNavItem.isActive}
        />
      </NavigationDrawerSection>

      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Other" />
        <NavigationDrawerItem
          label="Logout"
          onClick={handleLogout}
          Icon={IconDoorEnter}
        />
      </NavigationDrawerSection>
    </>
  );
};
