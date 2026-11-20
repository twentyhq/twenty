import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsRoleRouteGuard } from '@/settings/roles/components/SettingsRoleRouteGuard';
import { SettingsRoleRuleForm } from '@/settings/roles/role-permissions/rule-page/components/SettingsRoleRuleForm';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

export const SettingsRoleRule = () => {
  const { roleId, objectMetadataId } = useParams();
  const workspaceSurface = useWorkspaceSurface();
  const { objectMetadataItems } = useObjectMetadataItems();

  if (!isDefined(roleId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Roles)} />;
  }

  if (!isDefined(objectMetadataId)) {
    return (
      <Navigate to={getSettingsPath(SettingsPath.RoleDetail, { roleId })} />
    );
  }

  if (
    workspaceSurface.type === 'side-panel' &&
    !objectMetadataItems.some(
      (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
    )
  ) {
    return <WorkspaceRouteUnavailable />;
  }

  return (
    <SettingsRoleRouteGuard roleId={roleId}>
      <SettingsRoleRuleForm
        roleId={roleId}
        objectMetadataId={objectMetadataId}
      />
    </SettingsRoleRouteGuard>
  );
};
