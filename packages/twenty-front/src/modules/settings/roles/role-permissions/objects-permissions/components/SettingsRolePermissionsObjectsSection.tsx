import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { SettingsRolePermissionsAddObjectDropdown } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsAddObjectDropdown';
import { SettingsRolePermissionsAllObjectsCard } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsAllObjectsCard';
import { SettingsRolePermissionsObjectOverrideRow } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectOverrideRow';
import { OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/objects-permissions/constants/ObjectOverrideTableGridTemplateColumns';
import { hasObjectPermissionOverride } from '@/settings/roles/role-permissions/objects-permissions/utils/hasObjectPermissionOverride';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsRoleListedObjectOverrideIdsFamilyState } from '@/settings/roles/states/settingsRoleListedObjectOverrideIdsFamilyState';
import { Table } from '@/ui/layout/table/components/Table';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledOverridesTable = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
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
  const { t } = useLingui();
  const settingsRoleListedObjectOverrideIds = useAtomFamilyStateValue(
    settingsRoleListedObjectOverrideIdsFamilyState,
    roleId,
  );

  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const overriddenObjectMetadataItems =
    objectMetadataItemsThatCanHavePermission.filter(
      (objectMetadataItem) =>
        settingsRoleListedObjectOverrideIds.includes(objectMetadataItem.id) ||
        hasObjectPermissionOverride({
          role: settingsDraftRole,
          objectMetadataId: objectMetadataItem.id,
        }),
    );

  const addableObjectMetadataItems =
    objectMetadataItemsThatCanHavePermission.filter(
      (objectMetadataItem) =>
        !overriddenObjectMetadataItems.includes(objectMetadataItem),
    );

  return (
    <Section.Root>
      <Section.Header
        title={t`Objects`}
        description={t`Objects and fields permissions settings`}
      />
      <SettingsRolePermissionsAllObjectsCard
        roleId={roleId}
        isEditable={isEditable}
      />
      <StyledOverridesTable>
        <Table>
          <TableRow
            gridTemplateColumns={OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS}
          >
            <TableHeader>{t`Overrides`}</TableHeader>
            <TableHeader>{t`Access`}</TableHeader>
            <TableHeader />
          </TableRow>
          <StyledTableRows>
            {overriddenObjectMetadataItems.length > 0 ? (
              overriddenObjectMetadataItems.map((objectMetadataItem) => (
                <SettingsRolePermissionsObjectOverrideRow
                  key={objectMetadataItem.id}
                  roleId={roleId}
                  objectMetadataItem={objectMetadataItem}
                  isEditable={isEditable}
                  fromAgentId={fromAgentId}
                />
              ))
            ) : (
              <TableCell color={themeCssVariables.font.color.tertiary}>
                {t`Every object follows the all objects access.`}
              </TableCell>
            )}
          </StyledTableRows>
        </Table>
        {isEditable && (
          <TableFooter>
            <SettingsRolePermissionsAddObjectDropdown
              roleId={roleId}
              objectMetadataItems={addableObjectMetadataItems}
            />
          </TableFooter>
        )}
      </StyledOverridesTable>
    </Section.Root>
  );
};
