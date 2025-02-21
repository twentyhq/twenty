import {
  IconApps,
  IconAt,
  IconCalendarEvent,
  IconCode,
  IconColorSwatch,
  IconComponent,
  IconCurrencyDollar,
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

import { SettingsPath } from '@/types/SettingsPath';
import { SettingsFeatures } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { useSettingsPermissionMap } from '@/settings/roles/hooks/useSettingsPermissionMap';
import { NavigationDrawerItemIndentationLevel } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';

export type SettingsNavigationSection = {
  label: string;
  items: SettingsNavigationItem[];
  isAdvanced?: boolean;
};

export type SettingsNavigationItem = {
  label: string;
  path: SettingsPath;
  Icon: IconComponent;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  matchSubPages?: boolean;
  isHidden?: boolean;
  subItems?: SettingsNavigationItem[];
  isAdvanced?: boolean;
  soon?: boolean;
};

const useSettingsNavigationItems = (): SettingsNavigationSection[] => {
  const billing = useRecoilValue(billingState);

  const isFunctionSettingsEnabled = false;
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const currentUser = useRecoilValue(currentUserState);
  const isAdminEnabled = currentUser?.canImpersonate ?? false;
  const labPublicFeatureFlags = useRecoilValue(labPublicFeatureFlagsState);

  const featureFlags = useFeatureFlagsMap();
  const permissionMap = useSettingsPermissionMap();

  return [
    {
      label: t`User`,
      items: [
        {
          label: t`Profile`,
          path: SettingsPath.ProfilePage,
          Icon: IconUserCircle,
        },
        {
          label: t`Experience`,
          path: SettingsPath.Experience,
          Icon: IconColorSwatch,
        },
        {
          label: t`Accounts`,
          path: SettingsPath.Accounts,
          Icon: IconAt,
          matchSubPages: false,
          subItems: [
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
          ],
        },
      ],
    },
    {
      label: t`Workspace`,
      items: [
        {
          label: t`General`,
          path: SettingsPath.Workspace,
          Icon: IconSettings,
          isHidden: !permissionMap[SettingsFeatures.WORKSPACE],
        },
        {
          label: t`Members`,
          path: SettingsPath.WorkspaceMembersPage,
          Icon: IconUsers,
          isHidden: !permissionMap[SettingsFeatures.WORKSPACE_USERS],
        },
        {
          label: t`Billing`,
          path: SettingsPath.Billing,
          Icon: IconCurrencyDollar,
          isHidden:
            !isBillingEnabled || !permissionMap[SettingsFeatures.WORKSPACE],
        },
        {
          label: t`Roles`,
          path: SettingsPath.Roles,
          Icon: IconLock,
          isHidden:
            !featureFlags[FeatureFlagKey.IsPermissionsEnabled] ||
            !permissionMap[SettingsFeatures.ROLES],
        },
        {
          label: t`Data model`,
          path: SettingsPath.Objects,
          Icon: IconHierarchy2,
          isHidden: !permissionMap[SettingsFeatures.DATA_MODEL],
        },
        {
          label: t`Integrations`,
          path: SettingsPath.Integrations,
          Icon: IconApps,
          isHidden: !permissionMap[SettingsFeatures.API_KEYS_AND_WEBHOOKS],
        },
        {
          label: t`Security`,
          path: SettingsPath.Security,
          Icon: IconKey,
          isAdvanced: true,
          isHidden: !permissionMap[SettingsFeatures.SECURITY],
        },
      ],
    },
    {
      label: t`Developers`,
      isAdvanced: true,
      items: [
        {
          label: t`API & Webhooks`,
          path: SettingsPath.Developers,
          Icon: IconCode,
          isAdvanced: true,
          isHidden: !permissionMap[SettingsFeatures.API_KEYS_AND_WEBHOOKS],
        },
        {
          label: t`Functions`,
          path: SettingsPath.ServerlessFunctions,
          Icon: IconFunction,
          isHidden: !isFunctionSettingsEnabled,
          isAdvanced: true,
        },
      ],
    },
    {
      label: t`Other`,
      items: [
        {
          label: t`Server Admin`,
          path: SettingsPath.AdminPanel,
          Icon: IconServer,
          isHidden: !isAdminEnabled,
        },
        {
          label: t`Lab`,
          path: SettingsPath.Lab,
          Icon: IconFlask,
          isHidden:
            !labPublicFeatureFlags.length ||
            !permissionMap[SettingsFeatures.WORKSPACE],
        },
        {
          label: t`Releases`,
          path: SettingsPath.Releases,
          Icon: IconRocket,
        },
      ],
    },
  ];
};

export { useSettingsNavigationItems };
