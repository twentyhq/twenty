import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsRolePermissionsObjectsTableHeader } from '@/settings/roles/role-permissions/components/SettingsRolePermissionsObjectsTableHeader';
import { SettingsRolePermissionsObjectsTableRow } from '@/settings/roles/role-permissions/components/SettingsRolePermissionsObjectsTableRow';
import { SettingsRolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/components/SettingsRolePermissionsSettingsTableHeader';
import { SettingsRolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/components/SettingsRolePermissionsSettingsTableRow';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsRolePermissionsObjectPermission } from '@/settings/roles/types/SettingsRolePermissionsObjectPermission';
import { SettingsRolePermissionsSettingPermission } from '@/settings/roles/types/SettingsRolePermissionsSettingPermission';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import {
  Card,
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
import {
  FeatureFlagKey,
  SettingPermissionType,
} from '~/generated-metadata/graphql';

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

const StyledCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

type SettingsRolePermissionsProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissions = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsProps) => {
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

  const settingsPermissionsConfig: SettingsRolePermissionsSettingPermission[] =
    [
      {
        key: SettingPermissionType.API_KEYS_AND_WEBHOOKS,
        name: t`API Keys & Webhooks`,
        description: t`Manage API keys and webhooks`,
        Icon: IconCode,
      },
      {
        key: SettingPermissionType.WORKSPACE,
        name: t`Workspace`,
        description: t`Set global workspace preferences`,
        Icon: IconSettings,
      },
      {
        key: SettingPermissionType.WORKSPACE_MEMBERS,
        name: t`Users`,
        description: t`Add or remove users`,
        Icon: IconUsers,
      },
      {
        key: SettingPermissionType.ROLES,
        name: t`Roles`,
        description: t`Define user roles and access levels`,
        Icon: IconLockOpen,
      },
      {
        key: SettingPermissionType.DATA_MODEL,
        name: t`Data Model`,
        description: t`Edit CRM data structure and fields`,
        Icon: IconHierarchy,
      },
      {
        key: SettingPermissionType.ADMIN_PANEL,
        name: t`Admin Panel`,
        description: t`Admin settings and system tools`,
        Icon: IconServer,
      },
      {
        key: SettingPermissionType.SECURITY,
        name: t`Security`,
        description: t`Manage security policies`,
        Icon: IconKey,
      },
    ];

  const isPermissionsV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsV2Enabled,
  );

  return (
    <StyledRolePermissionsContainer>
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
      <Section>
        <H2Title title={t`Settings`} description={t`Settings permissions`} />
        {isPermissionsV2Enabled && (
          <StyledCard rounded>
            <SettingsOptionCardContentToggle
              Icon={IconSettings}
              title={t`Settings All Access`}
              description={t`Ability to edit all settings`}
              checked={settingsDraftRole.canUpdateAllSettings}
              disabled={!isEditable}
              onChange={() => {
                setSettingsDraftRole({
                  ...settingsDraftRole,
                  canUpdateAllSettings: !settingsDraftRole.canUpdateAllSettings,
                });
              }}
            />
          </StyledCard>
        )}
        <StyledTable>
          <SettingsRolePermissionsSettingsTableHeader />
          <StyledTableRows>
            {settingsPermissionsConfig.map((permission) => (
              <SettingsRolePermissionsSettingsTableRow
                key={permission.key}
                roleId={roleId}
                permission={permission}
                isEditable={isEditable}
              />
            ))}
          </StyledTableRows>
        </StyledTable>
      </Section>
    </StyledRolePermissionsContainer>
  );
};
