import { SettingsRolePermissionsObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableHeader';
import { SettingsRolePermissionsObjectLevelTableRow } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableRow';
import { useFilterObjectMetadataItemsWithPermissionOverride } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useFilterObjectWithPermissionOverride';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
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
  fromAgentId?: string;
};

const StyledNoOverride = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsRolePermissionsObjectLevelSection = ({
  roleId,
  fromAgentId,
}: SettingsRolePermissionsObjectLevelSectionProps) => {
  const navigateSettings = useNavigateSettings();

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const { filterObjectMetadataItemsWithPermissionOverride } =
    useFilterObjectMetadataItemsWithPermissionOverride({
      roleId,
    });

  const objectMetadataItemsWithPermissionOverride =
    objectMetadataItemsThatCanHavePermission.filter(
      filterObjectMetadataItemsWithPermissionOverride,
    );

  const allObjectsHaveSetPermission =
    objectMetadataItemsWithPermissionOverride.length ===
    objectMetadataItemsThatCanHavePermission.length;

  const handleAddRule = () => {
    navigateSettings(
      SettingsPath.RoleAddObjectLevel,
      { roleId },
      fromAgentId ? { fromAgent: fromAgentId } : undefined,
    );
  };

  const hasObjectPermissions =
    isDefined(objectMetadataItemsWithPermissionOverride) &&
    objectMetadataItemsWithPermissionOverride?.length > 0;

  return (
    <Section>
      <Table>
        <SettingsRolePermissionsObjectLevelTableHeader
          showPermissionsLabel={hasObjectPermissions}
        />
        <StyledTableRows>
          {hasObjectPermissions ? (
            objectMetadataItemsWithPermissionOverride.map(
              (objectMetadataItem) => (
                <SettingsRolePermissionsObjectLevelTableRow
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  roleId={roleId}
                  fromAgentId={fromAgentId}
                />
              ),
            )
          ) : (
            <StyledNoOverride>
              {t`No permissions have been set for individual objects.`}
            </StyledNoOverride>
          )}
        </StyledTableRows>
      </Table>
      <StyledCreateObjectOverrideSection>
        <Button
          Icon={IconPlus}
          title={t`Add rule`}
          variant="secondary"
          size="small"
          disabled={
            !settingsDraftRole.isEditable || allObjectsHaveSetPermission
          }
          onClick={handleAddRule}
        />
      </StyledCreateObjectOverrideSection>
    </Section>
  );
};
