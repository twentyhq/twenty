import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevelHeader } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevelHeader';
import { SettingsRolePermissionsObjectsTableRow } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsTableRow';
import { SettingsRolePermissionsObjectPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import {
  H2Title,
  IconEye,
  IconPencil,
  IconTrash,
  IconTrashX,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsRolePermissionsObjectLevelObjectFormObjectLevel = ({
  roleId,
  objectMetadataItem,
}: {
  roleId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const objectLabel = objectMetadataItem.labelPlural;

  const objectPermissionsConfig: SettingsRolePermissionsObjectPermission[] = [
    {
      key: 'seeRecords',
      label: t`See Records on ${objectLabel}`,
      Icon: IconEye,
      value: settingsDraftRole.canReadAllObjectRecords,
      setValue: (value: boolean) => {
        setSettingsDraftRole({
          ...settingsDraftRole,
          canReadAllObjectRecords: value,
        });
      },
    },
    {
      key: 'editRecords',
      label: t`Edit Records on ${objectLabel}`,
      Icon: IconPencil,
      value: settingsDraftRole.canUpdateAllObjectRecords,
      setValue: (value: boolean) => {
        setSettingsDraftRole({
          ...settingsDraftRole,
          canUpdateAllObjectRecords: value,
        });
      },
    },
    {
      key: 'deleteRecords',
      label: t`Delete Records on ${objectLabel}`,
      Icon: IconTrash,
      value: settingsDraftRole.canSoftDeleteAllObjectRecords,
      setValue: (value: boolean) => {
        setSettingsDraftRole({
          ...settingsDraftRole,
          canSoftDeleteAllObjectRecords: value,
        });
      },
    },
    {
      key: 'destroyRecords',
      label: t`Destroy Records on ${objectLabel}`,
      Icon: IconTrashX,
      value: settingsDraftRole.canDestroyAllObjectRecords,
      setValue: (value: boolean) => {
        setSettingsDraftRole({
          ...settingsDraftRole,
          canDestroyAllObjectRecords: value,
        });
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
