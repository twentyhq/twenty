import { useFilterObjectMetadataItemsWithPermissionOverride } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useFilterObjectWithPermissionOverride';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { SettingsRolePermissionsObjectsAddRuleDropdown } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsAddRuleDropdown';
import { SettingsRolePermissionsObjectsAllObjectsCard } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsAllObjectsCard';
import { SettingsRolePermissionsObjectsOverrideRow } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsOverrideRow';
import { SETTINGS_ROLE_OBJECT_OVERRIDES_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectOverridesTableGridTemplateColumns';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCardContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectsSectionProps = {
  roleId: string;
  isEditable: boolean;
  fromAgentId?: string;
};

export const SettingsRolePermissionsObjectsSection = ({
  roleId,
  isEditable,
  fromAgentId,
}: SettingsRolePermissionsObjectsSectionProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const { filterObjectMetadataItemsWithPermissionOverride } =
    useFilterObjectMetadataItemsWithPermissionOverride({ roleId });

  const objectMetadataItemsWithPermissionOverride =
    objectMetadataItemsThatCanHavePermission.filter(
      filterObjectMetadataItemsWithPermissionOverride,
    );

  const allObjectsHaveOverride =
    objectMetadataItemsWithPermissionOverride.length ===
    objectMetadataItemsThatCanHavePermission.length;

  return (
    <Section.Root>
      <Section.Header
        title={t`Objects`}
        description={t`Objects and fields permissions settings`}
      />
      <StyledCardContainer>
        <SettingsRolePermissionsObjectsAllObjectsCard
          roleId={roleId}
          isEditable={isEditable}
        />
      </StyledCardContainer>
      <Table>
        <TableRow
          gridTemplateColumns={
            SETTINGS_ROLE_OBJECT_OVERRIDES_TABLE_GRID_TEMPLATE_COLUMNS
          }
        >
          <TableHeader>{t`Overrides`}</TableHeader>
          <TableHeader>{t`Access`}</TableHeader>
          <TableHeader />
        </TableRow>
        <StyledTableRows>
          {isNonEmptyArray(objectMetadataItemsWithPermissionOverride) ? (
            objectMetadataItemsWithPermissionOverride.map(
              (objectMetadataItem) => (
                <SettingsRolePermissionsObjectsOverrideRow
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  roleId={roleId}
                  isEditable={isEditable}
                  fromAgentId={fromAgentId}
                />
              ),
            )
          ) : (
            <TableCell color={themeCssVariables.font.color.tertiary}>
              {t`No overrides yet. Every object follows the access above.`}
            </TableCell>
          )}
        </StyledTableRows>
      </Table>
      {isEditable && (
        <TableFooter>
          <SettingsRolePermissionsObjectsAddRuleDropdown
            roleId={roleId}
            disabled={!settingsDraftRole.isEditable || allObjectsHaveOverride}
            fromAgentId={fromAgentId}
          />
        </TableFooter>
      )}
    </Section.Root>
  );
};
