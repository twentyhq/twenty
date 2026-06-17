import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IconCode, type IconComponent, IconCurrencyDollar, IconDatabase, IconHierarchy, IconKey, IconSettings, IconSettingsAutomation, IconSparkles, IconTool, IconUsers } from 'twenty-ui/icon';
import { SystemPermissionFlag } from 'twenty-shared/constants';

export type PermissionSummaryItem = {
  Icon: IconComponent;
  label: string;
};

export const buildPermissionSummaryFromRoleManifest = (
  defaultRole: RoleManifest,
): PermissionSummaryItem[] => {
  const items: PermissionSummaryItem[] = [];

  const canRead = defaultRole.canReadAllObjectRecords ?? false;
  const canUpdate = defaultRole.canUpdateAllObjectRecords ?? false;
  const canSoftDelete = defaultRole.canSoftDeleteAllObjectRecords ?? false;
  const canDestroy = defaultRole.canDestroyAllObjectRecords ?? false;

  if (canRead || canUpdate || canSoftDelete || canDestroy) {
    const capabilities: string[] = [];

    if (canRead) {
      capabilities.push('read');
    }

    if (canUpdate) {
      capabilities.push('write');
    }

    if (canSoftDelete || canDestroy) {
      capabilities.push('delete');
    }

    const label =
      capabilities.length <= 2
        ? capabilities.join(' and ')
        : capabilities.slice(0, -1).join(', ') +
          ', and ' +
          capabilities[capabilities.length - 1];

    items.push({
      Icon: IconDatabase,
      label: label.charAt(0).toUpperCase() + label.slice(1) + ' records',
    });
  }

  if ((defaultRole.objectPermissions ?? []).length > 0 && items.length === 0) {
    items.push({
      Icon: IconDatabase,
      label: 'Access specific object records',
    });
  }

  const hasDataModelFlag = (
    defaultRole.permissionFlagUniversalIdentifiers ?? []
  ).some((flag) => flag === SystemPermissionFlag.DATA_MODEL);

  if (hasDataModelFlag) {
    items.push({
      Icon: IconHierarchy,
      label: 'Read and write data model configuration',
    });
  }

  if (defaultRole.canUpdateAllSettings) {
    items.push({
      Icon: IconSettings,
      label: 'Update workspace settings',
    });
  }

  if (defaultRole.canAccessAllTools) {
    items.push({
      Icon: IconTool,
      label: 'Access all tools',
    });
  }

  const otherFlags = (
    defaultRole.permissionFlagUniversalIdentifiers ?? []
  ).filter((flag) => flag !== SystemPermissionFlag.DATA_MODEL);

  const flagLabels: Record<string, { label: string; Icon: IconComponent }> = {
    [SystemPermissionFlag.WORKFLOWS]: {
      label: 'Manage workflows',
      Icon: IconSettingsAutomation,
    },
    [SystemPermissionFlag.SECURITY]: {
      label: 'Manage security settings',
      Icon: IconKey,
    },
    [SystemPermissionFlag.WORKSPACE_MEMBERS]: {
      label: 'Manage workspace members',
      Icon: IconUsers,
    },
    [SystemPermissionFlag.BILLING]: {
      label: 'Manage billing',
      Icon: IconCurrencyDollar,
    },
    [SystemPermissionFlag.API_KEYS_AND_WEBHOOKS]: {
      label: 'Manage API keys and webhooks',
      Icon: IconCode,
    },
    [SystemPermissionFlag.AI]: {
      label: 'Run AI agents',
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
