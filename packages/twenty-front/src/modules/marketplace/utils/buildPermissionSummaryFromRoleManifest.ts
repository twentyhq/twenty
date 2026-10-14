import { type PermissionSummaryItem } from '@/marketplace/types/PermissionSummaryItem';
import { type RecordAccess } from '@/marketplace/types/RecordAccess';
import { buildObjectRecordsPermissionSummary } from '@/marketplace/utils/buildObjectRecordsPermissionSummary';
import { buildPermissionFlagSummary } from '@/marketplace/utils/buildPermissionFlagSummary';
import { getRecordAccessLabel } from '@/marketplace/utils/getRecordAccessLabel';
import { t } from '@lingui/core/macro';
import { type RoleManifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { IconAddressBook, IconSettings, IconTool } from 'twenty-ui/icon';

export type { PermissionSummaryItem } from '@/marketplace/types/PermissionSummaryItem';

export type BuildPermissionSummaryOptions = {
  objectLabelsByUniversalIdentifier?: Record<string, string>;
  appPermissionFlagsByUniversalIdentifier?: ReadonlyMap<
    string,
    PermissionSummaryItem
  >;
};

const getRoleAccess = (defaultRole: RoleManifest): RecordAccess => ({
  canRead: defaultRole.canReadAllObjectRecords ?? false,
  canWrite: defaultRole.canUpdateAllObjectRecords ?? false,
  canDelete:
    (defaultRole.canSoftDeleteAllObjectRecords ?? false) ||
    (defaultRole.canDestroyAllObjectRecords ?? false),
});

export const buildPermissionSummaryFromRoleManifest = (
  defaultRole: RoleManifest,
  {
    objectLabelsByUniversalIdentifier = {},
    appPermissionFlagsByUniversalIdentifier = new Map(),
  }: BuildPermissionSummaryOptions = {},
): PermissionSummaryItem[] => {
  const roleAccess = getRoleAccess(defaultRole);

  const allRecordsLabel = getRecordAccessLabel({
    access: roleAccess,
    target: t`all records`,
  });

  const permissionFlagUniversalIdentifiers =
    defaultRole.permissionFlagUniversalIdentifiers ?? [];

  return [
    ...(isDefined(allRecordsLabel)
      ? [{ Icon: IconAddressBook, label: allRecordsLabel }]
      : []),
    ...buildObjectRecordsPermissionSummary({
      defaultRole,
      roleAccess,
      objectLabelsByUniversalIdentifier,
    }),
    ...buildPermissionFlagSummary({
      permissionFlagUniversalIdentifiers:
        permissionFlagUniversalIdentifiers.filter(
          (flag) => flag === SystemPermissionFlag.DATA_MODEL,
        ),
      appPermissionFlagsByUniversalIdentifier,
    }),
    ...(defaultRole.canUpdateAllSettings
      ? [{ Icon: IconSettings, label: t`Update all workspace settings` }]
      : []),
    ...(defaultRole.canAccessAllTools
      ? [{ Icon: IconTool, label: t`Use all tools` }]
      : []),
    ...buildPermissionFlagSummary({
      permissionFlagUniversalIdentifiers:
        permissionFlagUniversalIdentifiers.filter(
          (flag) => flag !== SystemPermissionFlag.DATA_MODEL,
        ),
      appPermissionFlagsByUniversalIdentifier,
    }),
  ];
};
