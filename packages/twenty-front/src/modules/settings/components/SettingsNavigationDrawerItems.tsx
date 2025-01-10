import { useRecoilValue } from 'recoil';
import {
  IconApps,
  IconAt,
  IconCalendarEvent,
  IconCode,
  IconColorSwatch,
  IconComponent,
  IconCurrencyDollar,
  IconDoorEnter,
  IconFunction,
  IconHierarchy2,
  IconKey,
  IconMail,
  IconRocket,
  IconServer,
  IconSettings,
  IconUserCircle,
  IconUsers
} from 'twenty-ui';

import { usePermissions } from '@/auth/contexts/PermissionContext';
import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsNavigationDrawerItem } from '@/settings/components/SettingsNavigationDrawerItem';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import {
  NavigationDrawerItem,
  NavigationDrawerItemIndentationLevel,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { IconIdBadge2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { matchPath, resolvePath, useLocation } from 'react-router-dom';
import { FeatureFlagKey } from '~/generated/graphql';

type SettingsNavigationItem = {
  label: string;
  path: SettingsPath;
  Icon: IconComponent;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  matchSubPages?: boolean;
};

export const SettingsNavigationDrawerItems = () => {
  const { signOut } = useAuth();

  const billing = useRecoilValue(billingState);
  const isFunctionSettingsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsFunctionSettingsEnabled,
  );
  const isFreeAccessEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsFreeAccessEnabled,
  );
  const isCRMMigrationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCrmMigrationEnabled,
  );
  const isBillingPageEnabled =
    billing?.isBillingEnabled && !isFreeAccessEnabled;

  const currentUser = useRecoilValue(currentUserState);
  const isAdminPageEnabled = currentUser?.canImpersonate;
  // TODO: Refactor this part to only have arrays of navigation items
  const currentPathName = useLocation().pathname;

  const { currentRole } = usePermissions();
  const { t } = useTranslation();
  
  const accountSubSettings: SettingsNavigationItem[] = [
    {
      label: 'Emails',
      path: SettingsPath.AccountsEmails,
      Icon: IconMail,
      indentationLevel: 2,
    },
    {
      label: 'Calendars',
      path: SettingsPath.AccountsCalendars,
      Icon: IconCalendarEvent,
      indentationLevel: 2,
    },
  ];

  const selectedIndex = accountSubSettings.findIndex((accountSubSetting) => {
    const href = getSettingsPagePath(accountSubSetting.path);
    const pathName = resolvePath(href).pathname;

    return matchPath(
      {
        path: pathName,
        end: accountSubSetting.matchSubPages === false,
      },
      currentPathName,
    );
  });

  return (
    <>
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="User" />
        <SettingsNavigationDrawerItem
          label={t('profile')}
          path={SettingsPath.ProfilePage}
          Icon={IconUserCircle}
        />
        <SettingsNavigationDrawerItem
          label={t('experience')}
          path={SettingsPath.Appearance}
          Icon={IconColorSwatch}
        />
        <NavigationDrawerItemGroup>
          <SettingsNavigationDrawerItem
            label={t('account')}
            path={SettingsPath.Accounts}
            Icon={IconAt}
            matchSubPages={false}
          />
          {accountSubSettings.map((navigationItem, index) => (
            <SettingsNavigationDrawerItem
              key={index}
              label={t(navigationItem.label.toLowerCase())}
              path={navigationItem.path}
              Icon={navigationItem.Icon}
              indentationLevel={navigationItem.indentationLevel}
              subItemState={getNavigationSubItemLeftAdornment({
                arrayLength: accountSubSettings.length,
                index,
                selectedIndex,
              })}
            />
          ))}
        </NavigationDrawerItemGroup>
      </NavigationDrawerSection>
      {currentRole?.canAccessWorkspaceSettings && (
        <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Workspace" />
        <SettingsNavigationDrawerItem
          label={t('general')}
          path={SettingsPath.Workspace}
          Icon={IconSettings}
        />
        <SettingsNavigationDrawerItem
          label={t('members')}
          path={SettingsPath.WorkspaceMembersPage}
          Icon={IconUsers}
        />
        <SettingsNavigationDrawerItem
          label={t('roles')}
          path={SettingsPath.MembersRoles}
          Icon={IconIdBadge2}
        />
        {isBillingPageEnabled && (
          <SettingsNavigationDrawerItem
            label={t('billing')}
            path={SettingsPath.Billing}
            Icon={IconCurrencyDollar}
          />
        )}
        <SettingsNavigationDrawerItem
          label={t('dataModel')}
          path={SettingsPath.Objects}
          Icon={IconHierarchy2}
        />
        <SettingsNavigationDrawerItem
          label={t('integrations')}
          path={SettingsPath.Integrations}
          Icon={IconApps}
        />
        {isCRMMigrationEnabled && (
          <SettingsNavigationDrawerItem
            label="CRM Migration"
            path={SettingsPath.CRMMigration}
            Icon={IconCode}
          />
        )}
        <AdvancedSettingsWrapper navigationDrawerItem={true}>
          <SettingsNavigationDrawerItem
            label={t('security')}
            path={SettingsPath.Security}
            Icon={IconKey}
          />
        </AdvancedSettingsWrapper>
        </NavigationDrawerSection>
      )}

      <NavigationDrawerSection>
        <AdvancedSettingsWrapper hideIcon>
          <NavigationDrawerSectionTitle label="Developers" />
            </AdvancedSettingsWrapper>
            <AdvancedSettingsWrapper navigationDrawerItem={true}>
            <SettingsNavigationDrawerItem
                label="API & Webhooks"
                path={SettingsPath.Developers}
                Icon={IconCode}
              />
            </AdvancedSettingsWrapper>
            {isFunctionSettingsEnabled && (
              <AdvancedSettingsWrapper navigationDrawerItem={true}>
                <SettingsNavigationDrawerItem
                  label="Functions"
                  path={SettingsPath.ServerlessFunctions}
                  Icon={IconFunction}
                />
              </AdvancedSettingsWrapper>
            )}
      </NavigationDrawerSection>

      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Other" />
        {isAdminPageEnabled && (
          <SettingsNavigationDrawerItem
            label={t('serverAdminPanel')}
            path={SettingsPath.AdminPanel}
            Icon={IconServer}
          />
        )}
        <SettingsNavigationDrawerItem
          label={t('releases')}
          path={SettingsPath.Releases}
          Icon={IconRocket}
        />
        <NavigationDrawerItem
          label={t('logout')}
          onClick={signOut}
          Icon={IconDoorEnter}
        />
      </NavigationDrawerSection>
    </>
  );
};
