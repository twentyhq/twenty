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
  IconFlask,
  IconFunction,
  IconHierarchy2,
  IconKey,
  IconLock,
  IconMail,
  IconRocket,
  IconServer,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsNavigationDrawerItem } from '@/settings/components/SettingsNavigationDrawerItem';
import { SettingsNavigationItemWrapper } from '@/settings/components/SettingsNavigationItemWrapper';
import { SettingsPath } from '@/types/SettingsPath';
import {
  NavigationDrawerItem,
  NavigationDrawerItemIndentationLevel,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useLingui } from '@lingui/react/macro';
import { matchPath, resolvePath, useLocation } from 'react-router-dom';
import { FeatureFlagKey, SettingsFeatures } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsNavigationSectionWrapper } from './SettingsNavigationSectionWrapper';

type SettingsNavigationItem = {
  label: string;
  path: SettingsPath;
  Icon: IconComponent;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  matchSubPages?: boolean;
};

export const SettingsNavigationDrawerItems = () => {
  const { signOut } = useAuth();

  const { t } = useLingui();

  const billing = useRecoilValue(billingState);

  // We want to disable this serverless function setting menu but keep the code
  // for now
  const isFunctionSettingsEnabled = false;

  const isBillingPageEnabled = billing?.isBillingEnabled;

  const currentUser = useRecoilValue(currentUserState);
  const isAdminPageEnabled = currentUser?.canImpersonate;
  const labPublicFeatureFlags = useRecoilValue(labPublicFeatureFlagsState);
  // TODO: Refactor this part to only have arrays of navigation items
  const currentPathName = useLocation().pathname;

  const accountSubSettings: SettingsNavigationItem[] = [
    {
      label: t`Emails`,
      path: SettingsPath.AccountsEmails,
      Icon: IconMail,
      indentationLevel: 2,
    },
    {
      label: t`Calendars`,
      path: SettingsPath.AccountsCalendars,
      Icon: IconCalendarEvent,
      indentationLevel: 2,
    },
  ];

  const selectedIndex = accountSubSettings.findIndex((accountSubSetting) => {
    const href = getSettingsPath(accountSubSetting.path);
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
      <SettingsNavigationSectionWrapper title={t`User`}>
        <SettingsNavigationDrawerItem
          label={t`Profile`}
          path={SettingsPath.ProfilePage}
          Icon={IconUserCircle}
        />
        <SettingsNavigationDrawerItem
          label={t`Experience`}
          path={SettingsPath.Experience}
          Icon={IconColorSwatch}
        />
        <NavigationDrawerItemGroup>
          <SettingsNavigationDrawerItem
            label={t`Accounts`}
            path={SettingsPath.Accounts}
            Icon={IconAt}
            matchSubPages={false}
          />
          {accountSubSettings.map((navigationItem, index) => (
            <SettingsNavigationDrawerItem
              key={index}
              label={navigationItem.label}
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
      </SettingsNavigationSectionWrapper>

      <SettingsNavigationSectionWrapper title={t`Workspace`}>
        <SettingsNavigationItemWrapper feature={SettingsFeatures.WORKSPACE}>
          <SettingsNavigationDrawerItem
            label={t`General`}
            path={SettingsPath.Workspace}
            Icon={IconSettings}
          />
        </SettingsNavigationItemWrapper>
        <SettingsNavigationItemWrapper
          feature={SettingsFeatures.WORKSPACE_USERS}
        >
          <SettingsNavigationDrawerItem
            label={t`Members`}
            path={SettingsPath.WorkspaceMembersPage}
            Icon={IconUsers}
          />
        </SettingsNavigationItemWrapper>
        {isBillingPageEnabled && (
          <SettingsNavigationDrawerItem
            label={t`Billing`}
            path={SettingsPath.Billing}
            Icon={IconCurrencyDollar}
          />
        )}
        <SettingsNavigationItemWrapper
          feature={SettingsFeatures.ROLES}
          requiredFeatureFlag={FeatureFlagKey.IsPermissionsEnabled}
        >
          <SettingsNavigationDrawerItem
            label={t`Roles`}
            path={SettingsPath.Roles}
            Icon={IconLock}
          />
        </SettingsNavigationItemWrapper>
        <SettingsNavigationItemWrapper feature={SettingsFeatures.DATA_MODEL}>
          <SettingsNavigationDrawerItem
            label={t`Data model`}
            path={SettingsPath.Objects}
            Icon={IconHierarchy2}
          />
        </SettingsNavigationItemWrapper>
        <SettingsNavigationItemWrapper
          feature={SettingsFeatures.API_KEYS_AND_WEBHOOKS}
        >
          <SettingsNavigationDrawerItem
            label={t`Integrations`}
            path={SettingsPath.Integrations}
            Icon={IconApps}
          />
        </SettingsNavigationItemWrapper>
        <AdvancedSettingsWrapper navigationDrawerItem={true}>
          <SettingsNavigationItemWrapper feature={SettingsFeatures.SECURITY}>
            <SettingsNavigationDrawerItem
              label={t`Security`}
              path={SettingsPath.Security}
              Icon={IconKey}
            />
          </SettingsNavigationItemWrapper>
        </AdvancedSettingsWrapper>
      </SettingsNavigationSectionWrapper>

      <SettingsNavigationSectionWrapper title={t`Developers`}>
        <AdvancedSettingsWrapper navigationDrawerItem={true}>
          <SettingsNavigationItemWrapper
            feature={SettingsFeatures.API_KEYS_AND_WEBHOOKS}
          >
            <SettingsNavigationDrawerItem
              label={t`API & Webhooks`}
              path={SettingsPath.Developers}
              Icon={IconCode}
            />
          </SettingsNavigationItemWrapper>
        </AdvancedSettingsWrapper>
        {isFunctionSettingsEnabled && (
          <AdvancedSettingsWrapper navigationDrawerItem={true}>
            <SettingsNavigationItemWrapper
              feature={SettingsFeatures.API_KEYS_AND_WEBHOOKS}
            >
              <SettingsNavigationDrawerItem
                label={t`Functions`}
                path={SettingsPath.ServerlessFunctions}
                Icon={IconFunction}
              />
            </SettingsNavigationItemWrapper>
          </AdvancedSettingsWrapper>
        )}
      </SettingsNavigationSectionWrapper>

      <SettingsNavigationSectionWrapper title={t`Other`}>
        {isAdminPageEnabled && (
          <SettingsNavigationItemWrapper feature={SettingsFeatures.ADMIN_PANEL}>
            <SettingsNavigationDrawerItem
              label={t`Server Admin`}
              path={SettingsPath.AdminPanel}
              Icon={IconServer}
            />
          </SettingsNavigationItemWrapper>
        )}
        {labPublicFeatureFlags?.length > 0 && (
          <SettingsNavigationDrawerItem
            label={t`Lab`}
            path={SettingsPath.Lab}
            Icon={IconFlask}
          />
        )}
        <SettingsNavigationDrawerItem
          label={t`Releases`}
          path={SettingsPath.Releases}
          Icon={IconRocket}
        />
        <NavigationDrawerItem
          label={t`Logout`}
          onClick={signOut}
          Icon={IconDoorEnter}
        />
      </SettingsNavigationSectionWrapper>
    </>
  );
};
