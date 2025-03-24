import { RolePermissionsObjectsTableHeader } from '@/settings/roles/role-permissions/components/RolePermissionsObjectsTableHeader';
import { RolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/components/RolePermissionsSettingsTableHeader';
import { RolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/components/RolePermissionsSettingsTableRow';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { RolePermissionsObjectPermission } from '@/settings/roles/types/RolePermissionsObjectPermission';
import { RolePermissionsSettingPermission } from '@/settings/roles/types/RolePermissionsSettingPermission';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import {
  H2Title,
  IconCode,
  IconEye,
  IconHierarchy,
  IconKey,
  IconLockOpen,
  IconPencil,
  IconServer,
  IconSettings,
  IconTrash,
  IconTrashX,
  IconUsers,
  Section,
} from 'twenty-ui';
import { SettingPermissionType } from '~/generated-metadata/graphql';
import { RolePermissionsObjectsTableRow } from './RolePermissionsObjectsTableRow';

const StyledRolePermissionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type RolePermissionsProps = {
  roleId: string;
  isEditable: boolean;
};

export const RolePermissions = ({
  roleId,
  isEditable,
}: RolePermissionsProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const objectPermissionsConfig: RolePermissionsObjectPermission[] = [
    {
      key: 'seeRecords',
      label: 'See Records on All Objects',
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
      label: 'Edit Records on All Objects',
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
      label: 'Delete Records on All Objects',
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
      label: 'Destroy Records on All Objects',
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

  const settingsPermissionsConfig: RolePermissionsSettingPermission[] = [
    {
      key: SettingPermissionType.API_KEYS_AND_WEBHOOKS,
      name: 'API Keys & Webhooks',
      description: 'Manage API keys and webhooks',
      value: settingsDraftRole.canUpdateAllSettings,
      Icon: IconCode,
    },
    {
      key: SettingPermissionType.WORKSPACE,
      name: 'Workspace',
      description: 'Set global workspace preferences',
      value: settingsDraftRole.canUpdateAllSettings,
      Icon: IconSettings,
    },
    {
      key: SettingPermissionType.WORKSPACE_MEMBERS,
      name: 'Users',
      description: 'Add or remove users',
      value: settingsDraftRole.canUpdateAllSettings,
      Icon: IconUsers,
    },
    {
      key: SettingPermissionType.ROLES,
      name: 'Roles',
      description: 'Define user roles and access levels',
      value: settingsDraftRole.canUpdateAllSettings,
      Icon: IconLockOpen,
    },
    {
      key: SettingPermissionType.DATA_MODEL,
      name: 'Data Model',
      description: 'Edit CRM data structure and fields',
      value: settingsDraftRole.canUpdateAllSettings,
      Icon: IconHierarchy,
    },
    {
      key: SettingPermissionType.ADMIN_PANEL,
      name: 'Admin Panel',
      description: 'Admin settings and system tools',
      value: settingsDraftRole.canUpdateAllSettings,
      Icon: IconServer,
    },
    {
      key: SettingPermissionType.SECURITY,
      name: 'Security',
      description: 'Manage security policies',
      value: settingsDraftRole.canUpdateAllSettings,
      Icon: IconKey,
    },
  ];

  return (
    <StyledRolePermissionsContainer>
      <Section>
        <H2Title
          title={t`Objects`}
          description={t`Ability to interact with each object`}
        />
        <StyledTable>
          <RolePermissionsObjectsTableHeader
            roleId={roleId}
            objectPermissionsConfig={objectPermissionsConfig}
            isEditable={isEditable}
          />
          <StyledTableRows>
            {objectPermissionsConfig.map((permission) => (
              <RolePermissionsObjectsTableRow
                key={permission.key}
                permission={permission}
                isEditable={isEditable}
              />
            ))}
          </StyledTableRows>
        </StyledTable>
      </Section>
      <Section>
        <H2Title title={t`Settings`} description={t`Settings permissions`} />
        <StyledTable>
          <RolePermissionsSettingsTableHeader
            allPermissions={settingsDraftRole.canUpdateAllSettings}
          />
          <StyledTableRows>
            {settingsPermissionsConfig.map((permission) => (
              <RolePermissionsSettingsTableRow
                key={permission.key}
                permission={permission}
              />
            ))}
          </StyledTableRows>
        </StyledTable>
      </Section>
    </StyledRolePermissionsContainer>
  );
};
