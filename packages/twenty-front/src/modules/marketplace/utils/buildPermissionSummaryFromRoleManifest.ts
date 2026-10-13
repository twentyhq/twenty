import { formatDisplayList } from '@/ai/utils/tool-display/formatDisplayList';
import { plural, t } from '@lingui/core/macro';
import { type RoleManifest } from 'twenty-shared/application';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  IconAddressBook,
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
  IconTool,
  IconUser,
  IconUsers,
} from 'twenty-ui/icon';

export type PermissionSummaryItem = {
  Icon: IconComponent;
  label: string;
};

export type BuildPermissionSummaryOptions = {
  objectLabelsByUniversalIdentifier?: Record<string, string>;
};

type RecordAccess = {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
};

type PermissionFlagSummaryConfig = {
  Icon: IconComponent;
  getLabel: () => string;
};

const PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER: Record<
  string,
  PermissionFlagType
> = Object.fromEntries(
  Object.entries(SystemPermissionFlag).map(
    ([flagType, universalIdentifier]) => [
      universalIdentifier,
      flagType as PermissionFlagType,
    ],
  ),
);

// Exhaustive on purpose: a flag an app requests must never be silently
// omitted from the consent screen.
const PERMISSION_FLAG_SUMMARY_CONFIGS: Record<
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

const getRecordAccessKey = ({ canRead, canWrite, canDelete }: RecordAccess) =>
  `${canRead ? 'read' : ''}-${canWrite ? 'write' : ''}-${canDelete ? 'delete' : ''}`;

const getRecordAccessLabel = (
  { canRead, canWrite, canDelete }: RecordAccess,
  target: string,
): string | undefined => {
  if (canRead && canWrite && canDelete) {
    return t`Read, write, and delete ${target}`;
  }

  if (canRead && canWrite) {
    return t`Read and write ${target}`;
  }

  if (canRead && canDelete) {
    return t`Read and delete ${target}`;
  }

  if (canWrite && canDelete) {
    return t`Write and delete ${target}`;
  }

  if (canRead) {
    return t`Read ${target}`;
  }

  if (canWrite) {
    return t`Write ${target}`;
  }

  if (canDelete) {
    return t`Delete ${target}`;
  }

  return undefined;
};

const buildAllRecordsItems = (
  defaultRole: RoleManifest,
): PermissionSummaryItem[] => {
  const label = getRecordAccessLabel(
    {
      canRead: defaultRole.canReadAllObjectRecords ?? false,
      canWrite: defaultRole.canUpdateAllObjectRecords ?? false,
      canDelete:
        (defaultRole.canSoftDeleteAllObjectRecords ?? false) ||
        (defaultRole.canDestroyAllObjectRecords ?? false),
    },
    t`all records`,
  );

  return isDefined(label) ? [{ Icon: IconAddressBook, label }] : [];
};

const buildObjectRecordsItems = (
  defaultRole: RoleManifest,
  objectLabelsByUniversalIdentifier: Record<string, string>,
): PermissionSummaryItem[] => {
  const objectPermissionsByAccessKey = new Map<
    string,
    { access: RecordAccess; objectUniversalIdentifiers: string[] }
  >();

  for (const objectPermission of defaultRole.objectPermissions ?? []) {
    const access: RecordAccess = {
      canRead: objectPermission.canReadObjectRecords ?? false,
      canWrite: objectPermission.canUpdateObjectRecords ?? false,
      canDelete:
        (objectPermission.canSoftDeleteObjectRecords ?? false) ||
        (objectPermission.canDestroyObjectRecords ?? false),
    };

    if (!access.canRead && !access.canWrite && !access.canDelete) {
      continue;
    }

    const accessKey = getRecordAccessKey(access);
    const group = objectPermissionsByAccessKey.get(accessKey) ?? {
      access,
      objectUniversalIdentifiers: [],
    };

    if (
      !group.objectUniversalIdentifiers.includes(
        objectPermission.objectUniversalIdentifier,
      )
    ) {
      group.objectUniversalIdentifiers.push(
        objectPermission.objectUniversalIdentifier,
      );
    }

    objectPermissionsByAccessKey.set(accessKey, group);
  }

  return Array.from(objectPermissionsByAccessKey.values()).flatMap(
    ({ access, objectUniversalIdentifiers }) => {
      const resolvedLabels = objectUniversalIdentifiers
        .map(
          (objectUniversalIdentifier) =>
            objectLabelsByUniversalIdentifier[objectUniversalIdentifier],
        )
        .filter(isDefined);

      const unresolvedCount =
        objectUniversalIdentifiers.length - resolvedLabels.length;

      const targetParts = [
        ...resolvedLabels,
        ...(unresolvedCount > 0
          ? [
              plural(unresolvedCount, {
                one: '# other object',
                other: '# other objects',
              }),
            ]
          : []),
      ];

      const label = getRecordAccessLabel(
        access,
        formatDisplayList(targetParts),
      );

      return isDefined(label) ? [{ Icon: IconAddressBook, label }] : [];
    },
  );
};

const buildPermissionFlagItems = (
  permissionFlagUniversalIdentifiers: string[],
): PermissionSummaryItem[] =>
  Array.from(new Set(permissionFlagUniversalIdentifiers)).flatMap(
    (universalIdentifier) => {
      const flagType =
        PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER[universalIdentifier];

      if (!isDefined(flagType)) {
        return [];
      }

      const { Icon, getLabel } = PERMISSION_FLAG_SUMMARY_CONFIGS[flagType];

      return [{ Icon, label: getLabel() }];
    },
  );

export const buildPermissionSummaryFromRoleManifest = (
  defaultRole: RoleManifest,
  {
    objectLabelsByUniversalIdentifier = {},
  }: BuildPermissionSummaryOptions = {},
): PermissionSummaryItem[] => {
  const allRecordsItems = buildAllRecordsItems(defaultRole);

  // Object-level grants only narrow things down once all-record access is granted
  const recordItems = isNonEmptyArray(allRecordsItems)
    ? allRecordsItems
    : buildObjectRecordsItems(defaultRole, objectLabelsByUniversalIdentifier);

  const permissionFlagUniversalIdentifiers =
    defaultRole.permissionFlagUniversalIdentifiers ?? [];

  const dataModelFlagItems = buildPermissionFlagItems(
    permissionFlagUniversalIdentifiers.filter(
      (flag) => flag === SystemPermissionFlag.DATA_MODEL,
    ),
  );

  const otherFlagItems = buildPermissionFlagItems(
    permissionFlagUniversalIdentifiers.filter(
      (flag) => flag !== SystemPermissionFlag.DATA_MODEL,
    ),
  );

  return [
    ...recordItems,
    ...dataModelFlagItems,
    ...(defaultRole.canUpdateAllSettings
      ? [{ Icon: IconSettings, label: t`Update all workspace settings` }]
      : []),
    ...(defaultRole.canAccessAllTools
      ? [{ Icon: IconTool, label: t`Use all tools` }]
      : []),
    ...otherFlagItems,
  ];
};
