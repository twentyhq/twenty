import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissionsObjectLevelObjectPicker } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelObjectPicker';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { Navigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

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
          { children: t`Roles`, href: getSettingsPath(SettingsPath.Roles) },
          {
            children: settingsDraftRole.label ?? '',
            href: getSettingsPath(SettingsPath.RoleDetail, { roleId }),
          },
          {
            children: t`Add object permission`,
            href: getSettingsPath(SettingsPath.RoleAddObjectLevel, { roleId }),
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
