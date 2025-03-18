import { RolePermissionsObjectsTableHeader } from '@/settings/roles/role-permissions/components/RolePermissionsObjectsTableHeader';
import { RolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/components/RolePermissionsSettingsTableHeader';
import { RolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/components/RolePermissionsSettingsTableRow';
import { RolePermissionsObjectPermission } from '@/settings/roles/types/RolePermissionsObjectPermission';
import { RolePermissionsSettingPermission } from '@/settings/roles/types/RolePermissionsSettingPermission';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
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
import { Role } from '~/generated-metadata/graphql';
import { SettingsPermissions } from '~/generated/graphql';
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
  role: Pick<
    Role,
    | 'id'
    | 'canUpdateAllSettings'
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >;
};

export const RolePermissions = ({ role }: RolePermissionsProps) => {
  const objectPermissionsConfig: RolePermissionsObjectPermission[] = [
    {
      key: 'seeRecords',
      label: 'See Records on All Objects',
      Icon: IconEye,
      value: role.canReadAllObjectRecords,
    },
    {
      key: 'editRecords',
      label: 'Edit Records on All Objects',
      Icon: IconPencil,
      value: role.canUpdateAllObjectRecords,
    },
    {
      key: 'deleteRecords',
      label: 'Delete Records on All Objects',
      Icon: IconTrash,
      value: role.canSoftDeleteAllObjectRecords,
    },
    {
      key: 'destroyRecords',
      label: 'Destroy Records on All Objects',
      Icon: IconTrashX,
      value: role.canDestroyAllObjectRecords,
    },
  ];

  const settingsPermissionsConfig: RolePermissionsSettingPermission[] = [
    {
      key: SettingsPermissions.API_KEYS_AND_WEBHOOKS,
      name: 'API Keys & Webhooks',
      description: 'Manage API keys and webhooks',
      value: role.canUpdateAllSettings,
      Icon: IconCode,
    },
    {
      key: SettingsPermissions.WORKSPACE,
      name: 'Workspace',
      description: 'Set global workspace preferences',
      value: role.canUpdateAllSettings,
      Icon: IconSettings,
    },
    {
      key: SettingsPermissions.WORKSPACE_MEMBERS,
      name: 'Users',
      description: 'Add or remove users',
      value: role.canUpdateAllSettings,
      Icon: IconUsers,
    },
    {
      key: SettingsPermissions.ROLES,
      name: 'Roles',
      description: 'Define user roles and access levels',
      value: role.canUpdateAllSettings,
      Icon: IconLockOpen,
    },
    {
      key: SettingsPermissions.DATA_MODEL,
      name: 'Data Model',
      description: 'Edit CRM data structure and fields',
      value: role.canUpdateAllSettings,
      Icon: IconHierarchy,
    },
    {
      key: SettingsPermissions.ADMIN_PANEL,
      name: 'Admin Panel',
      description: 'Admin settings and system tools',
      value: role.canUpdateAllSettings,
      Icon: IconServer,
    },
    {
      key: SettingsPermissions.SECURITY,
      name: 'Security',
      description: 'Manage security policies',
      value: role.canUpdateAllSettings,
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
            allPermissions={objectPermissionsConfig.every(
              (permission) => permission.value,
            )}
          />
          <StyledTableRows>
            {objectPermissionsConfig.map((permission) => (
              <RolePermissionsObjectsTableRow
                key={permission.key}
                permission={permission}
              />
            ))}
          </StyledTableRows>
        </StyledTable>
      </Section>
      <Section>
        <H2Title title={t`Settings`} description={t`Settings permissions`} />
        <StyledTable>
          <RolePermissionsSettingsTableHeader
            allPermissions={role.canUpdateAllSettings}
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
