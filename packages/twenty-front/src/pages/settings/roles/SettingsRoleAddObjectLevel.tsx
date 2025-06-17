import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissionsObjectLevelObjectPicker } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelObjectPicker';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { Navigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsRoleAddObjectLevel = () => {
  const { roleId } = useParams();
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId ?? ''),
  );

  if (!roleId) {
    return <Navigate to={getSettingsPath(SettingsPath.Roles)} />;
  }

  return (
    <>
      <SettingsRolesQueryEffect />
      <SubMenuTopBarContainer
        title={t`1. Select an object`}
        links={[
          { children: t`Roles`, href: '/settings/roles' },
          {
            children: settingsDraftRole.label ?? '',
            href: `/settings/roles/${roleId}`,
          },
          {
            children: t`Add object permission`,
            href: `/settings/roles/${roleId}/add-object-permission`,
          },
        ]}
      >
        <SettingsPageContainer>
          <SettingsRolePermissionsObjectLevelObjectPicker roleId={roleId} />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
