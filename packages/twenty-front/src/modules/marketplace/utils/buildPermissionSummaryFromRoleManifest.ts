import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';

export type PermissionSummaryItem = {
  Icon: IconComponent;
  label: string;
};

export const buildPermissionSummaryFromRoleManifest = (
  defaultRole: RoleManifest,
  icons: {
    IconListDetails: IconComponent;
    IconHierarchy: IconComponent;
    IconSettings: IconComponent;
    IconTool: IconComponent;
    IconEye: IconComponent;
    IconTrash: IconComponent;
  },
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
      Icon: icons.IconListDetails,
      label: label.charAt(0).toUpperCase() + label.slice(1) + ' records',
    });
  }

  if (
    (defaultRole.objectPermissions ?? []).length > 0 &&
    items.length === 0
  ) {
    items.push({
      Icon: icons.IconEye,
      label: 'Access specific object records',
    });
  }

  const hasDataModelFlag = (defaultRole.permissionFlags ?? []).some(
    (flag) => flag.flag === 'DATA_MODEL',
  );

  if (hasDataModelFlag) {
    items.push({
      Icon: icons.IconHierarchy,
      label: 'Read and write data model configuration',
    });
  }

  if (defaultRole.canUpdateAllSettings) {
    items.push({
      Icon: icons.IconSettings,
      label: 'Update workspace settings',
    });
  }

  if (defaultRole.canAccessAllTools) {
    items.push({
      Icon: icons.IconTool,
      label: 'Access all tools',
    });
  }

  const otherFlags = (defaultRole.permissionFlags ?? []).filter(
    (flag) => flag.flag !== 'DATA_MODEL',
  );

  const flagLabels: Record<string, { label: string; Icon: IconComponent }> = {
    WORKFLOWS: { label: 'Manage workflows', Icon: icons.IconSettings },
    SECURITY: { label: 'Manage security settings', Icon: icons.IconSettings },
    WORKSPACE_MEMBERS: {
      label: 'Manage workspace members',
      Icon: icons.IconSettings,
    },
    BILLING: { label: 'Manage billing', Icon: icons.IconSettings },
    API_KEYS_AND_WEBHOOKS: {
      label: 'Manage API keys and webhooks',
      Icon: icons.IconTool,
    },
  };

  for (const flag of otherFlags) {
    const config = flagLabels[flag.flag];

    if (isDefined(config)) {
      items.push(config);
    }
  }

  return items;
};
