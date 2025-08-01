import { SettingsPath } from '@/types/SettingsPath';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { NavigationDrawerItemIndentationLevel } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import {
  IconApi,
  IconApps,
  IconAt,
  IconCalendarEvent,
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
  IconSparkles,
  IconUserCircle,
  IconUsers,
  IconWebhook,
} from 'twenty-ui/display';
import { FeatureFlagKey, PermissionFlagType } from '~/generated/graphql';

export type SettingsNavigationSection = {
  label: string;
  items: SettingsNavigationItem[];
  isAdvanced?: boolean;
};

export type SettingsNavigationItem = {
  label: string;
  path?: SettingsPath;
  onClick?: () => void;
  Icon: IconComponent;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  matchSubPages?: boolean;
  isHidden?: boolean;
  subItems?: SettingsNavigationItem[];
  isAdvanced?: boolean;
  soon?: boolean;
  isNew?: boolean;
};

const useSettingsNavigationItems = (): SettingsNavigationSection[] => {
  const billing = useRecoilValue(billingState);
  const { signOut } = useAuth();

  const isFunctionSettingsEnabled = false;
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const currentUser = useRecoilValue(currentUserState);
  const isAdminEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) ??
    false;
  const labPublicFeatureFlags = useRecoilValue(labPublicFeatureFlagsState);
  const isAIEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const permissionMap = usePermissionFlagMap();
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
          isHidden: !permissionMap[PermissionFlagType.WORKSPACE],
        },
        {
          label: t`Members`,
          path: SettingsPath.WorkspaceMembersPage,
          Icon: IconUsers,
          isHidden: !permissionMap[PermissionFlagType.WORKSPACE_MEMBERS],
        },
        {
          label: t`Roles`,
          path: SettingsPath.Roles,
          Icon: IconLock,
          isHidden: !permissionMap[PermissionFlagType.ROLES],
        },
        {
          label: t`Billing`,
          path: SettingsPath.Billing,
          Icon: IconCurrencyDollar,
          isHidden:
            !isBillingEnabled || !permissionMap[PermissionFlagType.WORKSPACE],
        },
        {
          label: t`Data model`,
          path: SettingsPath.Objects,
          Icon: IconHierarchy2,
          isHidden: !permissionMap[PermissionFlagType.DATA_MODEL],
        },
        {
          label: t`Integrations`,
          path: SettingsPath.Integrations,
          Icon: IconApps,
          isHidden: !permissionMap[PermissionFlagType.API_KEYS_AND_WEBHOOKS],
        },
        {
          label: t`AI`,
          path: SettingsPath.AI,
          Icon: IconSparkles,
          isHidden:
            !isAIEnabled || !permissionMap[PermissionFlagType.WORKSPACE],
          isNew: true,
        },
        {
          label: t`Security`,
          path: SettingsPath.Security,
          Icon: IconKey,
          isAdvanced: true,
          isHidden: !permissionMap[PermissionFlagType.SECURITY],
        },
      ],
    },
    {
      label: t`Developers`,
      isAdvanced: false,
      items: [
        {
          label: t`APIs`,
          path: SettingsPath.APIs,
          Icon: IconApi,
          isAdvanced: false,
          isHidden: !permissionMap[PermissionFlagType.API_KEYS_AND_WEBHOOKS],
        },
        {
          label: t`Webhooks`,
          path: SettingsPath.Webhooks,
          Icon: IconWebhook,
          isAdvanced: false,
          isHidden: !permissionMap[PermissionFlagType.API_KEYS_AND_WEBHOOKS],
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
          label: t`Admin Panel`,
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
            !permissionMap[PermissionFlagType.WORKSPACE],
        },
        {
          label: t`Releases`,
          path: SettingsPath.Releases,
          Icon: IconRocket,
        },
        {
          label: t`Logout`,
          onClick: signOut,
          Icon: IconDoorEnter,
          matchSubPages: false,
        },
      ],
    },
  ];
};

export { useSettingsNavigationItems };
