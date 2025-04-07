import { Section } from '@react-email/components';

import { SettingsRolePermissionsObjectsTableHeader } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsTableHeader';
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

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsRolePermissionsObjectsSection = ({
  roleId,
  isEditable,
}: {
  roleId: string;
  isEditable: boolean;
}) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const objectPermissionsConfig: SettingsRolePermissionsObjectPermission[] = [
    {
      key: 'seeRecords',
      label: t`See Records on All Objects`,
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
      label: t`Edit Records on All Objects`,
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
      label: t`Delete Records on All Objects`,
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
      label: t`Destroy Records on All Objects`,
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
        title={t`Objects`}
        description={t`Ability to interact with each object`}
      />
      <StyledTable>
        <SettingsRolePermissionsObjectsTableHeader
          roleId={roleId}
          objectPermissionsConfig={objectPermissionsConfig}
          isEditable={isEditable}
        />
        <StyledTableRows>
          {objectPermissionsConfig.map((permission) => (
            <SettingsRolePermissionsObjectsTableRow
              key={permission.key}
              permission={permission}
              isEditable={isEditable}
            />
          ))}
        </StyledTableRows>
      </StyledTable>
    </Section>
  );
};
