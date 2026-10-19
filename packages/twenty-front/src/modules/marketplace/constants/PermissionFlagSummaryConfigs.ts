import { t } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import {
  IconApi,
  IconApps,
  IconAppWindow,
  IconAt,
  IconCalendarEvent,
  IconCode,
  type IconComponent,
  IconCreditCard,
  IconDownload,
  IconFileExport,
  IconFileImport,
  IconFileUpload,
  IconHierarchy,
  IconKey,
  IconLock,
  IconMail,
  IconPlug,
  IconSettings,
  IconSettingsAutomation,
  IconShield,
  IconShoppingBag,
  IconSparkles,
  IconSpy,
  IconTable,
  IconUser,
  IconUsers,
} from 'twenty-ui/icon';

export type PermissionFlagSummaryConfig = {
  Icon: IconComponent;
  getLabel: () => string;
};

export const PERMISSION_FLAG_SUMMARY_CONFIGS: Record<
  PermissionFlagType,
  PermissionFlagSummaryConfig
> = {
  [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: {
    Icon: IconPlug,
    getLabel: () => t`Manage MCP, API keys, and webhooks`,
  },
  [PermissionFlagType.WORKSPACE]: {
    Icon: IconSettings,
    getLabel: () => t`Manage workspace preferences`,
  },
  [PermissionFlagType.WORKSPACE_MEMBERS]: {
    Icon: IconUsers,
    getLabel: () => t`Manage workspace members`,
  },
  [PermissionFlagType.ROLES]: {
    Icon: IconLock,
    getLabel: () => t`Manage roles and permissions`,
  },
  [PermissionFlagType.DATA_MODEL]: {
    Icon: IconHierarchy,
    getLabel: () => t`Read and write data model configuration`,
  },
  [PermissionFlagType.SECURITY]: {
    Icon: IconKey,
    getLabel: () => t`Manage security settings`,
  },
  [PermissionFlagType.WORKFLOWS]: {
    Icon: IconSettingsAutomation,
    getLabel: () => t`Manage workflows`,
  },
  [PermissionFlagType.IMPERSONATE]: {
    Icon: IconSpy,
    getLabel: () => t`Impersonate workspace members`,
  },
  [PermissionFlagType.SSO_BYPASS]: {
    Icon: IconShield,
    getLabel: () => t`Bypass single sign-on`,
  },
  [PermissionFlagType.APPLICATIONS]: {
    Icon: IconApps,
    getLabel: () => t`Install and manage applications`,
  },
  [PermissionFlagType.MARKETPLACE_APPS]: {
    Icon: IconShoppingBag,
    getLabel: () => t`Manage the marketplace catalog`,
  },
  [PermissionFlagType.LAYOUTS]: {
    Icon: IconAppWindow,
    getLabel: () => t`Customize page layouts`,
  },
  [PermissionFlagType.BILLING]: {
    Icon: IconCreditCard,
    getLabel: () => t`Manage billing`,
  },
  [PermissionFlagType.AI_SETTINGS]: {
    Icon: IconSparkles,
    getLabel: () => t`Configure AI agents`,
  },
  [PermissionFlagType.AI]: {
    Icon: IconSparkles,
    getLabel: () => t`Run AI agents`,
  },
  [PermissionFlagType.VIEWS]: {
    Icon: IconTable,
    getLabel: () => t`Manage views`,
  },
  [PermissionFlagType.UPLOAD_FILE]: {
    Icon: IconFileUpload,
    getLabel: () => t`Upload files`,
  },
  [PermissionFlagType.DOWNLOAD_FILE]: {
    Icon: IconDownload,
    getLabel: () => t`Download files`,
  },
  [PermissionFlagType.SEND_EMAIL_TOOL]: {
    Icon: IconMail,
    getLabel: () => t`Send emails from connected accounts`,
  },
  [PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL]: {
    Icon: IconCalendarEvent,
    getLabel: () => t`Create calendar events`,
  },
  [PermissionFlagType.HTTP_REQUEST_TOOL]: {
    Icon: IconApi,
    getLabel: () => t`Make HTTP requests to external services`,
  },
  [PermissionFlagType.CODE_INTERPRETER_TOOL]: {
    Icon: IconCode,
    getLabel: () => t`Run code`,
  },
  [PermissionFlagType.IMPORT_CSV]: {
    Icon: IconFileImport,
    getLabel: () => t`Import CSV files`,
  },
  [PermissionFlagType.EXPORT_CSV]: {
    Icon: IconFileExport,
    getLabel: () => t`Export CSV files`,
  },
  [PermissionFlagType.CONNECTED_ACCOUNTS]: {
    Icon: IconAt,
    getLabel: () => t`Sync email and calendar accounts`,
  },
  [PermissionFlagType.PROFILE_INFORMATION]: {
    Icon: IconUser,
    getLabel: () => t`Edit profile information`,
  },
};
