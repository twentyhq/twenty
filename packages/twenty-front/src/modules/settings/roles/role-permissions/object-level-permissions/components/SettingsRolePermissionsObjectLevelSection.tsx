import { SettingsRolePermissionsObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableHeader';
import { SettingsRolePermissionsObjectLevelTableRow } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableRow';
import { useFilterObjectMetadataItemsWithPermissionOverride } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useFilterObjectWithPermissionOverride';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Table } from '@/ui/layout/table/components/Table';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectLevelSectionProps = {
  roleId: string;
  isEditable: boolean;
  fromAgentId?: string;
};

export const SettingsRolePermissionsObjectLevelSection = ({
  roleId,
  fromAgentId,
  isEditable,
}: SettingsRolePermissionsObjectLevelSectionProps) => {
  const navigateSettings = useNavigateSettings();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
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
    <Section.Root>
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
                  isEditable={isEditable}
                />
              ),
            )
          ) : (
            <TableCell color={themeCssVariables.font.color.tertiary}>
              {t`No permissions have been set for individual objects.`}
            </TableCell>
          )}
        </StyledTableRows>
      </Table>
      {isEditable && (
        <TableFooter>
          <Button
            startIcon={<IconPlus />}
            size="sm"
            disabled={
              !settingsDraftRole.isEditable || allObjectsHaveSetPermission
            }
            onClick={handleAddRule}
            variant="outline"
          >{t`Add rule`}</Button>
        </TableFooter>
      )}
    </Section.Root>
  );
};
