import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevelHeader } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevelHeader';
import { SettingsRolePermissionsObjectsTableRow } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsTableRow';
import { SettingsRolePermissionsObjectPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
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

  if (!settingsDraftRoleObjectPermissions) {
    return null;
  }

  const objectLabel = objectMetadataItem.labelPlural;

  const objectPermissionsConfig: SettingsRolePermissionsObjectPermission[] = [
    {
      key: 'canReadObjectRecords',
      label: t`See Records on ${objectLabel}`,
      value: settingsDraftRoleObjectPermissions.canReadObjectRecords,
      setValue: (_value: boolean) => {
        // TODO: Implement
      },
    },
    {
      key: 'canUpdateObjectRecords',
      label: t`Edit Records on ${objectLabel}`,
      value: settingsDraftRoleObjectPermissions.canUpdateObjectRecords,
      setValue: (_value: boolean) => {
        // TODO: Implement
      },
    },
    {
      key: 'canSoftDeleteObjectRecords',
      label: t`Delete Records on ${objectLabel}`,
      value: settingsDraftRoleObjectPermissions.canSoftDeleteObjectRecords,
      setValue: (_value: boolean) => {
        // TODO: Implement
      },
    },
    {
      key: 'canDestroyObjectRecords',
      label: t`Destroy Records on ${objectLabel}`,
      value: settingsDraftRoleObjectPermissions.canDestroyObjectRecords,
      setValue: (_value: boolean) => {
        // TODO: Implement
      },
    },
  ];

  return (
    <Section>
      <H2Title
        title={t`Object-Level Permissions`}
        description={t`Ability to interact with this specific object`}
      />
      <StyledTable>
        <SettingsRolePermissionsObjectLevelObjectFormObjectLevelHeader />
        <StyledTableRows>
          {objectPermissionsConfig.map((permission) => (
            <SettingsRolePermissionsObjectsTableRow
              key={permission.key}
              permission={permission}
              isEditable={settingsDraftRole.isEditable}
            />
          ))}
        </StyledTableRows>
      </StyledTable>
    </Section>
  );
};
