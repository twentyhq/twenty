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
import { NavigationDrawerItemIndentationLevel } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { SettingsFeatures } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type SettingsNavigationSection = {
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
  isHidden?: (params: {
    featureFlags: Record<FeatureFlagKey, boolean>;
    permissionMap: Record<SettingsFeatures, boolean>;
    isBillingEnabled: boolean;
    isFunctionSettingsEnabled: boolean;
    isAdminEnabled: boolean;
    hasLabFeatureFlags: boolean;
  }) => boolean;
  subItems?: SettingsNavigationItem[];
  isAdvanced?: boolean;
};

export const settingsNavItems: SettingsNavigationSection[] = [
  {
    label: 'User',
    items: [
      {
        label: 'Profile',
        path: SettingsPath.ProfilePage,
        Icon: IconUserCircle,
      },
      {
        label: 'Experience',
        path: SettingsPath.Experience,
        Icon: IconColorSwatch,
      },
      {
        label: 'Accounts',
        path: SettingsPath.Accounts,
        Icon: IconAt,
        matchSubPages: false,
        subItems: [
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
        ],
      },
    ],
  },
  {
    label: 'Workspace',
    items: [
      {
        label: 'General',
        path: SettingsPath.Workspace,
        Icon: IconSettings,
        isHidden: ({ permissionMap }) =>
          !permissionMap[SettingsFeatures.WORKSPACE],
      },
      {
        label: 'Members',
        path: SettingsPath.WorkspaceMembersPage,
        Icon: IconUsers,
        isHidden: ({ permissionMap }) =>
          !permissionMap[SettingsFeatures.WORKSPACE_USERS],
      },
      {
        label: 'Billing',
        path: SettingsPath.Billing,
        Icon: IconCurrencyDollar,
        isHidden: ({ isBillingEnabled }) => !isBillingEnabled,
      },
      {
        label: 'Roles',
        path: SettingsPath.Roles,
        Icon: IconLock,
        isHidden: ({ featureFlags, permissionMap }) =>
          !featureFlags[FeatureFlagKey.IsPermissionsEnabled] ||
          !permissionMap[SettingsFeatures.ROLES],
      },
      {
        label: 'Data model',
        path: SettingsPath.Objects,
        Icon: IconHierarchy2,
        isHidden: ({ permissionMap }) =>
          !permissionMap[SettingsFeatures.DATA_MODEL],
      },
      {
        label: 'Integrations',
        path: SettingsPath.Integrations,
        Icon: IconApps,
        isHidden: ({ permissionMap }) =>
          !permissionMap[SettingsFeatures.API_KEYS_AND_WEBHOOKS],
      },
      {
        label: 'Security',
        path: SettingsPath.Security,
        Icon: IconKey,
        isAdvanced: true,
        isHidden: ({ permissionMap }) =>
          !permissionMap[SettingsFeatures.SECURITY],
      },
    ],
  },
  {
    label: 'Developers',
    isAdvanced: true,
    items: [
      {
        label: 'API & Webhooks',
        path: SettingsPath.Developers,
        Icon: IconCode,
        isAdvanced: true,
        isHidden: ({ permissionMap }) =>
          !permissionMap[SettingsFeatures.API_KEYS_AND_WEBHOOKS],
      },
      {
        label: 'Functions',
        path: SettingsPath.ServerlessFunctions,
        Icon: IconFunction,
        isHidden: ({ isFunctionSettingsEnabled }) => !isFunctionSettingsEnabled,
        isAdvanced: true,
      },
    ],
  },
  {
    label: 'Other',
    items: [
      {
        label: 'Server Admin',
        path: SettingsPath.AdminPanel,
        Icon: IconServer,
        isHidden: ({ isAdminEnabled }) => !isAdminEnabled,
      },
      {
        label: 'Lab',
        path: SettingsPath.Lab,
        Icon: IconFlask,
        isHidden: ({ hasLabFeatureFlags }) => !hasLabFeatureFlags,
      },
      {
        label: 'Releases',
        path: SettingsPath.Releases,
        Icon: IconRocket,
      },
    ],
  },
];
