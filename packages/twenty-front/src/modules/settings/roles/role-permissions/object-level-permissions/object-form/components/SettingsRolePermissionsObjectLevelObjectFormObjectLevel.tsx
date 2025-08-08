import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableHeader';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow';
import { SettingsRolePermissionsObjectLevelPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type SettingsRolePermissionsObjectLevelObjectFormObjectLevelProps = {
  roleId: string;
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsRolePermissionsObjectLevelObjectFormObjectLevel = ({
  roleId,
  objectMetadataItem,
}: SettingsRolePermissionsObjectLevelObjectFormObjectLevelProps) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const settingsDraftRoleObjectPermissions =
    settingsDraftRole.objectPermissions?.find(
      (permission) => permission.objectMetadataId === objectMetadataItem.id,
    );

  const objectLabelPlural = objectMetadataItem.labelPlural;

  const objectPermissionsConfig: SettingsRolePermissionsObjectLevelPermission[] =
    [
      {
        key: 'canReadObjectRecords',
        label: t`See ${objectLabelPlural}`,
        value: settingsDraftRoleObjectPermissions?.canReadObjectRecords,
      },
      {
        key: 'canUpdateObjectRecords',
        label: t`Edit ${objectLabelPlural}`,
        value: settingsDraftRoleObjectPermissions?.canUpdateObjectRecords,
      },
      {
        key: 'canSoftDeleteObjectRecords',
        label: t`Delete ${objectLabelPlural}`,
        value: settingsDraftRoleObjectPermissions?.canSoftDeleteObjectRecords,
      },
      {
        key: 'canDestroyObjectRecords',
        label: t`Destroy ${objectLabelPlural}`,
        value: settingsDraftRoleObjectPermissions?.canDestroyObjectRecords,
      },
    ];

  return (
    <Section>
      <H2Title
        title={t`Object-Level`}
        description={t`Actions users can perform on this object`}
      />
      <StyledTable>
        <SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableHeader />
        <StyledTableRows>
          {objectPermissionsConfig.map((permission) => (
            <SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow
              key={permission.key}
              permission={permission}
              isEditable={settingsDraftRole.isEditable}
              settingsDraftRoleObjectPermissions={
                settingsDraftRoleObjectPermissions
              }
              roleId={roleId}
              objectMetadataItemId={objectMetadataItem.id}
            />
          ))}
        </StyledTableRows>
      </StyledTable>
    </Section>
  );
};
