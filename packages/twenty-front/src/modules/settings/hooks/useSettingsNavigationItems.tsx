import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { billingState } from '@/client-config/states/billingState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import {
  type NavigationDrawerItemIndentationLevel,
  type NavigationDrawerItemModifier,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  IconApi,
  // IconApps, // TODO: Re-enable when integrations page is ready
  IconAt,
  IconCalendarEvent,
  IconColorSwatch,
  type IconComponent,
  IconCurrencyDollar,
  IconDoorEnter,
  IconHelpCircle,
  IconHierarchy2,
  IconKey,
  IconLayout,
  IconMail,
  IconMessage,
  IconPlug,
  IconRocket,
  IconServer,
  IconSettings,
  IconSparkles,
  IconUserCircle,
  IconUsers,
} from 'twenty-ui/display';
import { PermissionFlagType } from '~/generated-metadata/graphql';

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
  // Optional theme color (e.g. 'blue', 'orange') — when set, the icon is
  // rendered inside a tinted tile via TintedIconTile, matching the look of
  // object icons in the main app drawer. Without it, the icon is monochrome.
  iconColor?: string;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  matchSubPages?: boolean;
  isHidden?: boolean;
  subItems?: SettingsNavigationItem[];
  isAdvanced?: boolean;
  modifier?: NavigationDrawerItemModifier;
};

const useSettingsNavigationItems = (): SettingsNavigationSection[] => {
  const billing = useAtomStateValue(billingState);
  const { signOut } = useAuth();
  const supportChat = useAtomStateValue(supportChatState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const currentUser = useAtomStateValue(currentUserState);
  const isAdminEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) ??
    false;
  const isSupportChatConfigured =
    supportChat?.supportDriver === 'FRONT' &&
    isNonEmptyString(supportChat.supportFrontChatId);

  const permissionMap = usePermissionFlagMap();
  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );
  return [
    {
      label: t`User`,
      items: [
        {
          label: t`Profile`,
          path: SettingsPath.ProfilePage,
          Icon: IconUserCircle,
          iconColor: 'blue',
        },
        {
          label: t`Experience`,
          path: SettingsPath.Experience,
          Icon: IconColorSwatch,
          iconColor: 'purple',
        },
        {
          label: t`Accounts`,
          path: SettingsPath.Accounts,
          Icon: IconAt,
          iconColor: 'orange',
          isHidden: !permissionMap[PermissionFlagType.CONNECTED_ACCOUNTS],
          subItems: [
            {
              label: t`Emails`,
              path: SettingsPath.AccountsEmails,
              Icon: IconMail,
              iconColor: 'red',
              isHidden: !permissionMap[PermissionFlagType.CONNECTED_ACCOUNTS],
              indentationLevel: 2,
            },
            {
              label: t`Calendars`,
              path: SettingsPath.AccountsCalendars,
              Icon: IconCalendarEvent,
              iconColor: 'green',
              isHidden: !permissionMap[PermissionFlagType.CONNECTED_ACCOUNTS],
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
          iconColor: 'gray',
          isHidden: !permissionMap[PermissionFlagType.WORKSPACE],
        },
        {
          label: t`Data model`,
          path: SettingsPath.Objects,
          Icon: IconHierarchy2,
          iconColor: 'purple',
          isHidden: !permissionMap[PermissionFlagType.DATA_MODEL],
        },
        {
          label: t`Layout`,
          path: SettingsPath.Layout,
          Icon: IconLayout,
          iconColor: 'blue',
          isHidden: !permissionMap[PermissionFlagType.WORKSPACE],
        },
        {
          label: t`Members`,
          path: SettingsPath.WorkspaceMembersPage,
          Icon: IconUsers,
          iconColor: 'pink',
          isHidden: !permissionMap[PermissionFlagType.WORKSPACE_MEMBERS],
        },
        {
          label: t`Billing`,
          path: SettingsPath.Billing,
          Icon: IconCurrencyDollar,
          iconColor: 'green',
          isHidden:
            !isBillingEnabled || !permissionMap[PermissionFlagType.WORKSPACE],
        },
        {
          label: t`APIs & Webhooks`,
          path: SettingsPath.ApiWebhooks,
          Icon: IconApi,
          iconColor: 'orange',
          isHidden: !permissionMap[PermissionFlagType.API_KEYS_AND_WEBHOOKS],
        },
        // TODO: Re-enable when integrations page is ready
        // {
        //   label: t`Integrations`,
        //   path: SettingsPath.Integrations,
        //   Icon: IconApps,
        //   isHidden: !permissionMap[PermissionFlagType.API_KEYS_AND_WEBHOOKS],
        // },
        {
          label: t`Apps`,
          path: SettingsPath.Applications,
          Icon: IconPlug,
          iconColor: 'turquoise',
          isHidden: !permissionMap[PermissionFlagType.APPLICATIONS],
          modifier: 'new',
        },
        {
          label: t`AI`,
          path: SettingsPath.AI,
          Icon: IconSparkles,
          iconColor: 'violet',
          isHidden: !permissionMap[PermissionFlagType.WORKSPACE],
          modifier: 'new',
        },
        {
          label: t`Email`,
          path: SettingsPath.WorkspaceEmail,
          Icon: IconMail,
          iconColor: 'red',
          isHidden:
            !isEmailGroupFeatureEnabled ||
            !permissionMap[PermissionFlagType.WORKSPACE],
        },
        {
          label: t`Security`,
          path: SettingsPath.Security,
          Icon: IconKey,
          iconColor: 'yellow',
          isAdvanced: true,
          isHidden: !permissionMap[PermissionFlagType.SECURITY],
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
          iconColor: 'bronze',
          isHidden: !isAdminEnabled,
        },
        {
          label: t`Updates`,
          path: SettingsPath.Updates,
          Icon: IconRocket,
          iconColor: 'orange',
          isHidden: !permissionMap[PermissionFlagType.WORKSPACE],
        },
        {
          label: t`Support`,
          onClick: () => window.FrontChat?.('show'),
          Icon: IconMessage,
          iconColor: 'sky',
          isHidden: !isSupportChatConfigured,
        },
        {
          label: t`Documentation`,
          onClick: () =>
            window.open(
              getDocumentationUrl({ locale: currentWorkspaceMember?.locale }),
              '_blank',
            ),
          Icon: IconHelpCircle,
          iconColor: 'cyan',
        },
        {
          label: t`Logout`,
          onClick: signOut,
          Icon: IconDoorEnter,
          iconColor: 'gray',
          matchSubPages: false,
        },
      ],
    },
  ];
};

export { useSettingsNavigationItems };
