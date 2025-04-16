import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableHeader';
import { SettingsRolePermissionsObjectLevelTableRow } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableRow';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

// const StyledCreateObjectOverrideSection = styled(Section)`
//   border-top: 1px solid ${({ theme }) => theme.border.color.light};
//   display: flex;
//   justify-content: flex-end;
//   padding-top: ${({ theme }) => theme.spacing(2)};
//   padding-bottom: ${({ theme }) => theme.spacing(2)};
// `;

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
}: SettingsRolePermissionsObjectLevelSectionProps) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const objectMetadataItems = useObjectMetadataItems();

  const objectMetadataMap = objectMetadataItems.objectMetadataItems.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<string, ObjectMetadataItem>,
  );

  const objectPermissions = settingsDraftRole.objectPermissions;

  // const handleSelectObjectMetadata = (objectMetadataId: string) => {
  //   setSettingsDraftRole((draftRole) => ({
  //     ...draftRole,
  //     objectPermissions: [
  //       ...(draftRole.objectPermissions ?? []),
  //       { objectMetadataId, roleId, id: v4() },
  //     ],
  //   }));
  // };

  return (
    <Section>
      <H2Title
        title={t`Object-Level Permissions`}
        description={t`Set additional object-level permissions`}
      />
      <Table>
        <SettingsRolePermissionsObjectLevelTableHeader />
        <StyledTableRows>
          {isDefined(objectPermissions) && objectPermissions?.length > 0 ? (
            objectPermissions?.map((objectPermission) => (
              <SettingsRolePermissionsObjectLevelTableRow
                key={objectPermission.id}
                objectPermission={objectPermission}
                objectMetadataItem={
                  objectMetadataMap[objectPermission.objectMetadataId]
                }
              />
            ))
          ) : (
            <StyledNoOverride>{t`No overrides found`}</StyledNoOverride>
          )}
        </StyledTableRows>
      </Table>
      {/* <StyledCreateObjectOverrideSection>
        <Dropdown
          dropdownId="role-object-select"
          dropdownHotkeyScope={{ scope: 'roleObject' }}
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
            <SettingsRolePermissionsObjectLevelObjectPickerDropdownContent
              excludedObjectMetadataIds={[]}
              onSelect={handleSelectObjectMetadata}
            />
          }
        />
      </StyledCreateObjectOverrideSection> */}
    </Section>
  );
};
