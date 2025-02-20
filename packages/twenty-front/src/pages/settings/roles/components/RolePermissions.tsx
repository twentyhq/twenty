import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  H2Title,
  IconEye,
  IconPencil,
  IconTrash,
  IconTrashX,
  Section,
} from 'twenty-ui';
import { Role, SettingsFeatures } from '~/generated-metadata/graphql';
import { RolePermissionsObjectsTableHeader } from '~/pages/settings/roles/components/RolePermissionsObjectsTableHeader';
import { RolePermissionsSettingsTableHeader } from '~/pages/settings/roles/components/RolePermissionsSettingsTableHeader';
import { RolePermissionsSettingsTableRow } from '~/pages/settings/roles/components/RolePermissionsSettingsTableRow';
import { RolePermissionsObjectPermission } from '~/pages/settings/roles/types/RolePermissionsObjectPermission';
import { RolePermissionsObjectsTableRow } from './RolePermissionsObjectsTableRow';

const StyledRolePermissionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
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
      icon: <IconEye size={14} />,
      value: role.canReadAllObjectRecords,
    },
    {
      key: 'editRecords',
      label: 'Edit Records on All Objects',
      icon: <IconPencil size={14} />,
      value: role.canUpdateAllObjectRecords,
    },
    {
      key: 'deleteRecords',
      label: 'Delete Records on All Objects',
      icon: <IconTrash size={14} />,
      value: role.canSoftDeleteAllObjectRecords,
    },
    {
      key: 'destroyRecords',
      label: 'Destroy Records on All Objects',
      icon: <IconTrashX size={14} />,
      value: role.canDestroyAllObjectRecords,
    },
  ];

  const settingsPermissionsConfig = [
    {
      key: SettingsFeatures.API_KEYS_AND_WEBHOOKS,
      label: 'API Keys and Webhooks',
      type: 'Developer',
      value: role.canUpdateAllSettings,
    },
    {
      key: SettingsFeatures.ROLES,
      label: 'Roles',
      type: 'Members',
      value: role.canUpdateAllSettings,
    },
    {
      key: SettingsFeatures.WORKSPACE,
      label: 'Workspace Settings',
      type: 'General',
      value: role.canUpdateAllSettings,
    },
    {
      key: SettingsFeatures.WORKSPACE_USERS,
      label: 'Workspace Users',
      type: 'Members',
      value: role.canUpdateAllSettings,
    },
    {
      key: SettingsFeatures.DATA_MODEL,
      label: 'Data Model',
      type: 'Data Model',
      value: role.canUpdateAllSettings,
    },
    {
      key: SettingsFeatures.ADMIN_PANEL,
      label: 'Admin Panel',
      type: 'Admin Panel',
      value: role.canUpdateAllSettings,
    },
    {
      key: SettingsFeatures.SECURITY,
      label: 'Security Settings',
      type: 'Security',
      value: role.canUpdateAllSettings,
    },
  ];

  return (
    <StyledRolePermissionsContainer>
      <Section>
        <H2Title
          title={t`Objects`}
          description={t`Ability to interact with each object`}
        />
        <RolePermissionsObjectsTableHeader allPermissions={true} />
        {objectPermissionsConfig.map((permission) => (
          <RolePermissionsObjectsTableRow
            key={permission.key}
            permission={permission}
          />
        ))}
      </Section>
      <Section>
        <H2Title title={t`Settings`} description={t`Settings permissions`} />
        <RolePermissionsSettingsTableHeader
          allPermissions={role.canUpdateAllSettings}
        />
        {settingsPermissionsConfig.map((permission) => (
          <RolePermissionsSettingsTableRow
            key={permission.key}
            permission={permission}
          />
        ))}
      </Section>
    </StyledRolePermissionsContainer>
  );
};
