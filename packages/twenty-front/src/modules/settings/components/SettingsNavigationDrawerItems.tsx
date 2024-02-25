import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { SettingsNavigationDrawerItem } from '@/settings/components/SettingsNavigationDrawerItem';
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

  return (
    <>
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="User" />
        <SettingsNavigationDrawerItem
          label="Profile"
          path={SettingsPath.ProfilePage}
          Icon={IconUserCircle}
        />
        <SettingsNavigationDrawerItem
          label="Appearance"
          path={SettingsPath.Appearance}
          Icon={IconColorSwatch}
        />

        {isMessagingEnabled && (
          <NavigationDrawerItemGroup>
            <SettingsNavigationDrawerItem
              label="Accounts"
              path={SettingsPath.Accounts}
              Icon={IconAt}
            />
            <SettingsNavigationDrawerItem
              level={2}
              label="Emails"
              path={SettingsPath.AccountsEmails}
              Icon={IconMail}
              matchSubPages
            />
            <SettingsNavigationDrawerItem
              level={2}
              label="Calendars"
              path={SettingsPath.AccountsCalendars}
              Icon={IconCalendarEvent}
              matchSubPages
              soon={!isCalendarEnabled}
            />
          </NavigationDrawerItemGroup>
        )}
      </NavigationDrawerSection>

      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Workspace" />
        <SettingsNavigationDrawerItem
          label="General"
          path={SettingsPath.Workspace}
          Icon={IconSettings}
        />
        <SettingsNavigationDrawerItem
          label="Members"
          path={SettingsPath.WorkspaceMembersPage}
          Icon={IconUsers}
        />
        <SettingsNavigationDrawerItem
          label="Data model"
          path={SettingsPath.Objects}
          Icon={IconHierarchy2}
          matchSubPages
        />
        <SettingsNavigationDrawerItem
          label="Developers"
          path={SettingsPath.Developers}
          Icon={IconRobot}
        />
        <SettingsNavigationDrawerItem
          label="Integrations"
          path={SettingsPath.Integrations}
          Icon={IconApps}
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
