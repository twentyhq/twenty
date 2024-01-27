import { useCallback } from 'react';
import { useMatch, useNavigate, useResolvedPath } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import {
  IconAt,
  // IconCalendarEvent,
  IconColorSwatch,
  IconHierarchy2,
  IconLogout,
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
  const isMessagingEnabled = useIsFeatureEnabled('IS_MESSAGING_ENABLED');
  const isAccountsItemActive = !!useMatch({
    path: useResolvedPath('/settings/accounts').pathname,
    end: true,
  });
  const isAccountsEmailsItemActive = !!useMatch({
    path: useResolvedPath('/settings/accounts/emails').pathname,
    end: true,
  });

  return (
    <>
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={translate('user')} />
        <NavigationDrawerItem
          label={translate('profile')}
          to="/settings/profile"
          Icon={IconUserCircle}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/profile').pathname,
              end: true,
            })
          }
        />
        <NavigationDrawerItem
          label={translate('appearance')}
          to="/settings/profile/appearance"
          Icon={IconColorSwatch}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/profile/appearance').pathname,
              end: true,
            })
          }
        />
        {isMessagingEnabled && (
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label={translate('accounts')}
              to="/settings/accounts"
              Icon={IconAt}
              active={isAccountsItemActive}
            />
            <NavigationDrawerItem
              level={2}
              label={translate('emails')}
              to="/settings/accounts/emails"
              Icon={IconMail}
              active={isAccountsEmailsItemActive}
            />
            {/*<NavigationDrawerItem*/}
            {/*  level={2}*/}
            {/*  label={translate('calendars')}*/}
            {/*  Icon={IconCalendarEvent}*/}
            {/*  soon*/}
            {/*/>*/}
          </NavigationDrawerItemGroup>
        )}
      </NavigationDrawerSection>

      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={translate('workspace')} />
        <NavigationDrawerItem
          label={translate('general')}
          to="/settings/workspace"
          Icon={IconSettings}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/workspace').pathname,
              end: true,
            })
          }
        />
        <NavigationDrawerItem
          label={translate('members')}
          to="/settings/workspace-members"
          Icon={IconUsers}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/workspace-members').pathname,
              end: true,
            })
          }
        />
        <NavigationDrawerItem
          label={translate('dataModel')}
          to="/settings/objects"
          Icon={IconHierarchy2}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/objects').pathname,
              end: false,
            })
          }
        />
        <NavigationDrawerItem
          label={translate('developers')}
          to="/settings/developers"
          Icon={IconRobot}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/developers').pathname,
              end: true,
            })
          }
        />
      </NavigationDrawerSection>

      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={translate('other')} />
        <NavigationDrawerItem
          label={translate('logout')}
          onClick={handleLogout}
          Icon={IconLogout}
        />
      </NavigationDrawerSection>
    </>
  );
};
