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
import useI18n from '@/ui/i18n/useI18n';
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

  const { translate } = useI18n('translations');
  const isCalendarEnabled = useIsFeatureEnabled('IS_CALENDAR_ENABLED');
  const isMessagingEnabled = useIsFeatureEnabled('IS_MESSAGING_ENABLED');

  return (
    <>
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={translate('user')} />
        <SettingsNavigationDrawerItem
          label={translate('profile')}
          path={SettingsPath.ProfilePage}
          Icon={IconUserCircle}
        />
        <SettingsNavigationDrawerItem
          label={translate('appearance')}
          path={SettingsPath.Appearance}
          Icon={IconColorSwatch}
        />

        {isMessagingEnabled && (
          <NavigationDrawerItemGroup>
            <SettingsNavigationDrawerItem
              label={translate('accounts')}
              path={SettingsPath.Accounts}
              Icon={IconAt}
            />
            <SettingsNavigationDrawerItem
              level={2}
              label={translate('emails')}
              path={SettingsPath.AccountsEmails}
              Icon={IconMail}
              matchSubPages
            />
            <SettingsNavigationDrawerItem
              level={2}
              label={translate('calendars')}
              path={SettingsPath.AccountsCalendars}
              Icon={IconCalendarEvent}
              matchSubPages
              soon={!isCalendarEnabled}
            />
          </NavigationDrawerItemGroup>
        )}
      </NavigationDrawerSection>

      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={translate('workspace')} />
        <SettingsNavigationDrawerItem
          label={translate('general')}
          path={SettingsPath.Workspace}
          Icon={IconSettings}
        />
        <SettingsNavigationDrawerItem
          label={translate('members')}
          path={SettingsPath.WorkspaceMembersPage}
          Icon={IconUsers}
        />
        <SettingsNavigationDrawerItem
          label={translate('dataModel')}
          path={SettingsPath.Objects}
          Icon={IconHierarchy2}
          matchSubPages
        />
        <SettingsNavigationDrawerItem
          label={translate('developers')}
          path={SettingsPath.Developers}
          Icon={IconRobot}
        />
        <SettingsNavigationDrawerItem
          label={translate('integrations')}
          path={SettingsPath.Integrations}
          Icon={IconApps}
        />
      </NavigationDrawerSection>

      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={translate('other')} />
        <NavigationDrawerItem
          label={translate('logout')}
          onClick={handleLogout}
          Icon={IconDoorEnter}
        />
      </NavigationDrawerSection>
    </>
  );
};
