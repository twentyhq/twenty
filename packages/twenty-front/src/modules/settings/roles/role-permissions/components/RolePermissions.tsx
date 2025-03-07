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
  IconLock,
  IconPencil,
  IconSettings,
  IconTrash,
  IconTrashX,
  IconUserCog,
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
  padding-bottom: ${({ theme }) => theme.spacing(2)};
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
      label: 'Manage API Keys & Webhooks',
      type: 'Developer',
      value: role.canUpdateAllSettings,
      Icon: IconCode,
    },
    {
      key: SettingsPermissions.WORKSPACE,
      label: 'Manage Workspace Settings',
      type: 'General',
      value: role.canUpdateAllSettings,
      Icon: IconSettings,
    },
    {
      key: SettingsPermissions.WORKSPACE_MEMBERS,
      label: 'Manage Members',
      type: 'Members',
      value: role.canUpdateAllSettings,
      Icon: IconUsers,
    },
    {
      key: SettingsPermissions.ROLES,
      label: 'Manage Roles',
      type: 'Members',
      value: role.canUpdateAllSettings,
      Icon: IconLock,
    },
    {
      key: SettingsPermissions.DATA_MODEL,
      label: 'Manage Data Model',
      type: 'Data Model',
      value: role.canUpdateAllSettings,
      Icon: IconHierarchy,
    },
    {
      key: SettingsPermissions.ADMIN_PANEL,
      label: 'Manage Admin Panel',
      type: 'Admin Panel',
      value: role.canUpdateAllSettings,
      Icon: IconUserCog,
    },
    {
      key: SettingsPermissions.SECURITY,
      label: 'Manage Security Settings',
      type: 'Security',
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
          <RolePermissionsObjectsTableHeader allPermissions={true} />
          {objectPermissionsConfig.map((permission) => (
            <RolePermissionsObjectsTableRow
              key={permission.key}
              permission={permission}
            />
          ))}
        </StyledTable>
      </Section>
      <Section>
        <H2Title title={t`Settings`} description={t`Settings permissions`} />
        <StyledTable>
          <RolePermissionsSettingsTableHeader
            allPermissions={role.canUpdateAllSettings}
          />
          {settingsPermissionsConfig.map((permission) => (
            <RolePermissionsSettingsTableRow
              key={permission.key}
              permission={permission}
            />
          ))}
        </StyledTable>
      </Section>
    </StyledRolePermissionsContainer>
  );
};
