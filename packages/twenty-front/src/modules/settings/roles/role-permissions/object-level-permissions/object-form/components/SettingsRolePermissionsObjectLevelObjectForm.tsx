import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolePermissionsObjectLevelObjectFieldPermissionTable } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelObjectFieldPermissionTable';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevel } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevel';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { Button } from 'twenty-ui/input';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsRolePermissionsObjectLevelObjectFormProps = {
  roleId: string;
  objectMetadataId: string;
};

export const SettingsRolePermissionsObjectLevelObjectForm = ({
  roleId,
  objectMetadataId,
}: SettingsRolePermissionsObjectLevelObjectFormProps) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const objectMetadata = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const objectMetadataItem = objectMetadata.objectMetadataItem;

  const objectLabelSingular = objectMetadataItem.labelSingular;
  const objectLabelPlural = objectMetadataItem.labelPlural;

  return (
    <SubMenuTopBarContainer
      title={t`2. Set ${objectLabelPlural} permissions`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Roles`,
          href: getSettingsPath(SettingsPath.Roles),
        },
        {
          children: settingsDraftRole.label,
          href: getSettingsPath(SettingsPath.RoleDetail, {
            roleId,
          }),
        },
        {
          children: t`Permissions · ${objectLabelSingular}`,
        },
      ]}
      actionButton={
        <Button
          title={t`Finish`}
          variant="secondary"
          size="small"
          accent="blue"
          to={getSettingsPath(SettingsPath.RoleDetail, {
            roleId,
          })}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsRolePermissionsObjectLevelObjectFormObjectLevel
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
        />
        <SettingsRolePermissionsObjectLevelObjectFieldPermissionTable
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
