import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsRolePermissionsObjectsTableHeader } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsTableHeader';
import { SettingsRolePermissionsObjectsTableRow } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsTableRow';
import { type SettingsRolePermissionsObjectPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { H2Title, IconDatabase } from 'twenty-ui/display';
import { AnimatedExpandableContainer, Card, Section } from 'twenty-ui/layout';

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

type SettingsRolePermissionsObjectsSectionProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectsSection = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsObjectsSectionProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const objectPermissions = settingsDraftRole.objectPermissions;

  const objectPermissionsConfig: SettingsRolePermissionsObjectPermission[] = [
    {
      key: 'canReadObjectRecords',
      label: t`See Records on All Objects`,
      grantedBy:
        objectPermissions?.filter(
          (permission) =>
            permission.canReadObjectRecords === true &&
            settingsDraftRole.canReadAllObjectRecords === false,
        )?.length ?? 0,
      revokedBy:
        objectPermissions?.filter(
          (permission) =>
            permission.canReadObjectRecords === false &&
            settingsDraftRole.canReadAllObjectRecords === true,
        )?.length ?? 0,
      value: settingsDraftRole.canReadAllObjectRecords,
      setValue: (value: boolean) => {
        setSettingsDraftRole({
          ...settingsDraftRole,
          canReadAllObjectRecords: value,
          ...(value === false
            ? {
                canUpdateAllObjectRecords: value,
                canSoftDeleteAllObjectRecords: value,
                canDestroyAllObjectRecords: value,
              }
            : {}),
        });
      },
    },
    {
      key: 'canUpdateObjectRecords',
      label: t`Edit Records on All Objects`,
      grantedBy:
        objectPermissions?.filter(
          (permission) =>
            permission.canUpdateObjectRecords === true &&
            settingsDraftRole.canUpdateAllObjectRecords === false,
        )?.length ?? 0,
      revokedBy:
        objectPermissions?.filter(
          (permission) =>
            permission.canUpdateObjectRecords === false &&
            settingsDraftRole.canUpdateAllObjectRecords === true,
        )?.length ?? 0,
      value: settingsDraftRole.canUpdateAllObjectRecords,
      setValue: (value: boolean) => {
        setSettingsDraftRole({
          ...settingsDraftRole,
          canUpdateAllObjectRecords: value,
          ...(value === true
            ? {
                canReadAllObjectRecords: value,
              }
            : {}),
        });
      },
    },
    {
      key: 'canSoftDeleteObjectRecords',
      label: t`Delete Records on All Objects`,
      grantedBy:
        objectPermissions?.filter(
          (permission) =>
            permission.canSoftDeleteObjectRecords === true &&
            settingsDraftRole.canSoftDeleteAllObjectRecords === false,
        )?.length ?? 0,
      revokedBy:
        objectPermissions?.filter(
          (permission) =>
            permission.canSoftDeleteObjectRecords === false &&
            settingsDraftRole.canSoftDeleteAllObjectRecords === true,
        )?.length ?? 0,
      value: settingsDraftRole.canSoftDeleteAllObjectRecords,
      setValue: (value: boolean) => {
        setSettingsDraftRole({
          ...settingsDraftRole,
          canSoftDeleteAllObjectRecords: value,
          ...(value === true
            ? {
                canReadAllObjectRecords: value,
              }
            : {}),
        });
      },
    },
    {
      key: 'canDestroyObjectRecords',
      label: t`Destroy Records on All Objects`,
      grantedBy:
        objectPermissions?.filter(
          (permission) =>
            permission.canDestroyObjectRecords === true &&
            settingsDraftRole.canDestroyAllObjectRecords === false,
        )?.length ?? 0,
      revokedBy:
        objectPermissions?.filter(
          (permission) =>
            permission.canDestroyObjectRecords === false &&
            settingsDraftRole.canDestroyAllObjectRecords === true,
        )?.length ?? 0,
      value: settingsDraftRole.canDestroyAllObjectRecords,
      setValue: (value: boolean) => {
        setSettingsDraftRole({
          ...settingsDraftRole,
          canDestroyAllObjectRecords: value,
          ...(value === true
            ? {
                canReadAllObjectRecords: value,
              }
            : {}),
        });
      },
    },
  ];

  return (
    <Section>
      <H2Title
        title={t`Objects`}
        description={t`Objects and fields permissions settings`}
      />
      <StyledCard rounded>
        <SettingsOptionCardContentToggle
          Icon={IconDatabase}
          title={t`Data full access`}
          description={t`See, edit, delete and destroy all records`}
          checked={settingsDraftRole.canUpdateAllObjectRecords}
          disabled={!isEditable}
          onChange={() => {
            setSettingsDraftRole({
              ...settingsDraftRole,
              canUpdateAllObjectRecords:
                !settingsDraftRole.canUpdateAllObjectRecords,
            });
          }}
        />
      </StyledCard>
      <AnimatedExpandableContainer
        isExpanded={!settingsDraftRole.canUpdateAllObjectRecords}
        dimension="height"
        animationDurations={{
          opacity: 0.2,
          size: 0.4,
        }}
        mode="scroll-height"
        containAnimation={false}
      >
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
      </AnimatedExpandableContainer>
    </Section>
  );
};
