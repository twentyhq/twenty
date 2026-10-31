import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { t } from '@lingui/core/macro';
import { type AiRunScope } from 'twenty-shared/ai';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { WorkflowAiAgentPermissionsPermissionRow } from './WorkflowAiAgentPermissionsPermissionRow';

type WorkflowAiAgentAllObjectsPermissionListProps = {
  scope: AiRunScope | undefined;
  readonly: boolean;
  searchQuery: string;
  onDeletePermission: (permissionKey: SettingsRoleObjectPermissionKey) => void;
};

export const WorkflowAiAgentAllObjectsPermissionList = ({
  scope,
  readonly,
  searchQuery,
  onDeletePermission,
}: WorkflowAiAgentAllObjectsPermissionListProps) => {
  const allObjectsLabel = t`all objects`;
  const grantedPermissions = filterBySearchQuery({
    items: CRUD_PERMISSIONS.filter(
      (permission) =>
        scope?.[
          SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
            permission.key
          ]
        ] ?? false,
    ).map((permission) => ({
      key: permission.key,
      label: permission.label(allObjectsLabel),
    })),
    searchQuery,
    getSearchableValues: (permission) => [permission.label],
  });

  if (grantedPermissions.length === 0) {
    return null;
  }

  return (
    <SidePanelGroup heading={t`All objects`}>
      {grantedPermissions.map((permission) => (
        <WorkflowAiAgentPermissionsPermissionRow
          key={permission.key}
          permission={permission}
          isEnabled={true}
          readonly={readonly}
          onDelete={() => onDeletePermission(permission.key)}
        />
      ))}
    </SidePanelGroup>
  );
};
