import { t } from '@lingui/core/macro';
import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconAddressBook,
  IconCreditCard,
  IconHierarchy,
  IconKey,
  IconPlug,
  IconSettings,
  IconSettingsAutomation,
  IconSparkles,
  IconTool,
  IconUsers,
} from 'twenty-ui/icon';
import { SystemPermissionFlag } from 'twenty-shared/constants';

export type PermissionSummaryItem = {
  Icon: IconComponent;
  label: string;
};

// One full sentence per combination, so translators can reorder the words
const getRecordPermissionLabel = ({
  canRead,
  canUpdate,
  canDelete,
}: {
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}): string => {
  if (canRead && canUpdate && canDelete) {
    return t`Read, write, and delete records`;
  }

  if (canRead && canUpdate) {
    return t`Read and write records`;
  }

  if (canRead && canDelete) {
    return t`Read and delete records`;
  }

  if (canUpdate && canDelete) {
    return t`Write and delete records`;
  }

  if (canRead) {
    return t`Read records`;
  }

  if (canUpdate) {
    return t`Write records`;
  }

  return t`Delete records`;
};

export const buildPermissionSummaryFromRoleManifest = (
  defaultRole: RoleManifest,
): PermissionSummaryItem[] => {
  const items: PermissionSummaryItem[] = [];

  const canRead = defaultRole.canReadAllObjectRecords ?? false;
  const canUpdate = defaultRole.canUpdateAllObjectRecords ?? false;
  const canSoftDelete = defaultRole.canSoftDeleteAllObjectRecords ?? false;
  const canDestroy = defaultRole.canDestroyAllObjectRecords ?? false;
  const canDelete = canSoftDelete || canDestroy;

  if (canRead || canUpdate || canDelete) {
    items.push({
      Icon: IconAddressBook,
      label: getRecordPermissionLabel({ canRead, canUpdate, canDelete }),
    });
  }

  if ((defaultRole.objectPermissions ?? []).length > 0 && items.length === 0) {
    items.push({
      Icon: IconAddressBook,
      label: t`Access specific object records`,
    });
  }

  const hasDataModelFlag = (
    defaultRole.permissionFlagUniversalIdentifiers ?? []
  ).some((flag) => flag === SystemPermissionFlag.DATA_MODEL);

  if (hasDataModelFlag) {
    items.push({
      Icon: IconHierarchy,
      label: t`Read and write data model configuration`,
    });
  }

  if (defaultRole.canUpdateAllSettings) {
    items.push({
      Icon: IconSettings,
      label: t`Update workspace settings`,
    });
  }

  if (defaultRole.canAccessAllTools) {
    items.push({
      Icon: IconTool,
      label: t`Access all tools`,
    });
  }

  const otherFlags = (
    defaultRole.permissionFlagUniversalIdentifiers ?? []
  ).filter((flag) => flag !== SystemPermissionFlag.DATA_MODEL);

  const flagLabels: Record<string, { label: string; Icon: IconComponent }> = {
    [SystemPermissionFlag.WORKFLOWS]: {
      label: t`Manage workflows`,
      Icon: IconSettingsAutomation,
    },
    [SystemPermissionFlag.SECURITY]: {
      label: t`Manage security settings`,
      Icon: IconKey,
    },
    [SystemPermissionFlag.WORKSPACE_MEMBERS]: {
      label: t`Manage workspace members`,
      Icon: IconUsers,
    },
    [SystemPermissionFlag.BILLING]: {
      label: t`Manage billing`,
      Icon: IconCreditCard,
    },
    [SystemPermissionFlag.API_KEYS_AND_WEBHOOKS]: {
      label: t`Manage MCP, API keys, and webhooks`,
      Icon: IconPlug,
    },
    [SystemPermissionFlag.AI]: {
      label: t`Run AI agents`,
      Icon: IconSparkles,
    },
  };

  for (const flag of otherFlags) {
    const config = flagLabels[flag];

    if (isDefined(config)) {
      items.push(config);
    }
  }

  return items;
};
