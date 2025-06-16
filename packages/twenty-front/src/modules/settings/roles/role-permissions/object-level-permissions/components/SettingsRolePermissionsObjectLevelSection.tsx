import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableHeader';
import { SettingsRolePermissionsObjectLevelTableRow } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableRow';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

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
  const [settingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const navigateSettings = useNavigateSettings();

  const objectMetadataItems = useObjectMetadataItems();

  const objectMetadataMap = objectMetadataItems.objectMetadataItems.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<string, ObjectMetadataItem>,
  );

  const filteredObjectPermissions = settingsDraftRole.objectPermissions?.filter(
    (objectPermission) =>
      (isDefined(objectPermission.canReadObjectRecords) &&
        objectPermission.canReadObjectRecords !==
          settingsDraftRole.canReadAllObjectRecords) ||
      (isDefined(objectPermission.canUpdateObjectRecords) &&
        objectPermission.canUpdateObjectRecords !==
          settingsDraftRole.canUpdateAllObjectRecords) ||
      (isDefined(objectPermission.canSoftDeleteObjectRecords) &&
        objectPermission.canSoftDeleteObjectRecords !==
          settingsDraftRole.canSoftDeleteAllObjectRecords) ||
      (isDefined(objectPermission.canDestroyObjectRecords) &&
        objectPermission.canDestroyObjectRecords !==
          settingsDraftRole.canDestroyAllObjectRecords),
  );

  const handleAddRule = () => {
    navigateSettings(SettingsPath.RoleAddObjectLevel, {
      roleId,
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Object-Level Permissions`}
        description={t`Ability to interact with specific objects`}
      />
      <Table>
        <SettingsRolePermissionsObjectLevelTableHeader />
        <StyledTableRows>
          {isDefined(filteredObjectPermissions) &&
          filteredObjectPermissions?.length > 0 ? (
            filteredObjectPermissions?.map((objectPermission) => (
              <SettingsRolePermissionsObjectLevelTableRow
                key={objectPermission.objectMetadataId}
                objectPermission={objectPermission}
                objectMetadataItem={
                  objectMetadataMap[objectPermission.objectMetadataId]
                }
                roleId={roleId}
              />
            ))
          ) : (
            <StyledNoOverride>{t`No overrides found`}</StyledNoOverride>
          )}
        </StyledTableRows>
      </Table>
      <StyledCreateObjectOverrideSection>
        <Button
          Icon={IconPlus}
          title={t`Add rule`}
          variant="secondary"
          size="small"
          disabled={!isEditable}
          onClick={handleAddRule}
        />
      </StyledCreateObjectOverrideSection>
    </Section>
  );
};
