import { useObjectMetadataMapById } from '@/object-metadata/hooks/useObjectMetadataMapById';
import { SettingsRolePermissionsObjectLevelObjectPickerDropdown } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelObjectPickerDropdown';
import { SettingsRolePermissionsObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableHeader';
import { SettingsRolePermissionsObjectLevelTableRow } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableRow';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { v4 } from 'uuid';

const StyledCreateObjectOverrideSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type SettingsRolePermissionsObjectLevelSectionProps = {
  roleId: string;
  isEditable: boolean;
};

const StyledNoOverride = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsRolePermissionsObjectLevelSection = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsObjectLevelSectionProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const objectMetadataMap = useObjectMetadataMapById();

  const objectPermissions = settingsDraftRole.objectPermissions;

  const handleSelectObjectMetadata = (objectMetadataId: string) => {
    setSettingsDraftRole((draftRole) => ({
      ...draftRole,
      objectPermissions: [
        ...(draftRole.objectPermissions ?? []),
        { objectMetadataId, roleId, id: v4() },
      ],
    }));
  };

  return (
    <Section>
      <H2Title
        title={t`Object-Level Permissions`}
        description={t`Set additional object-level permissions`}
      />
      <Table>
        <SettingsRolePermissionsObjectLevelTableHeader />
        <StyledTableRows>
          {objectPermissions?.length === 0 ? (
            <StyledNoOverride>{t`No overrides found`}</StyledNoOverride>
          ) : (
            objectPermissions?.map((objectPermission) => (
              <SettingsRolePermissionsObjectLevelTableRow
                key={objectPermission.id}
                objectPermission={objectPermission}
                objectMetadataItem={
                  objectMetadataMap[objectPermission.objectMetadataId]
                }
              />
            ))
          )}
        </StyledTableRows>
      </Table>
      <StyledCreateObjectOverrideSection>
        <Dropdown
          dropdownId="role-member-select"
          dropdownHotkeyScope={{ scope: 'roleAssignment' }}
          clickableComponent={
            <Button
              Icon={IconPlus}
              title={t`Add Object`}
              variant="secondary"
              size="small"
              disabled={!isEditable}
            />
          }
          dropdownComponents={
            <SettingsRolePermissionsObjectLevelObjectPickerDropdown
              excludedObjectMetadataIds={[]}
              onSelect={handleSelectObjectMetadata}
            />
          }
        />
      </StyledCreateObjectOverrideSection>
    </Section>
  );
};
