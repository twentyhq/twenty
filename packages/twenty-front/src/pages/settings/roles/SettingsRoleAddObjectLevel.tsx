import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissionsObjectLevelObjectPicker } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelObjectPicker';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const SettingsRoleAddObjectLevel = () => {
  const { roleId } = useParams();
  const settingsDraftRole = useRecoilValue(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    settingsDraftRoleFamilyState(roleId!),
  );

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
          <SettingsRolePermissionsObjectLevelObjectPicker />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
