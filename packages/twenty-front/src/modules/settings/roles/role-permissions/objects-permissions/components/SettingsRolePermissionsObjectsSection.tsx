import { useFilterObjectMetadataItemsWithPermissionOverride } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useFilterObjectWithPermissionOverride';
import { useObjectMetadataItemsThatCanHavePermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useObjectMetadataItemsThatCanHavePermission';
import { useResetObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useResetObjectPermission';
import { SettingsRolePermissionsAddObjectDropdown } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsAddObjectDropdown';
import { SettingsRolePermissionsAllObjectsCard } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsAllObjectsCard';
import {
  OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS,
  SettingsRolePermissionsObjectOverrideRow,
} from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectOverrideRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
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
  const [addedObjectMetadataIds, setAddedObjectMetadataIds] = useState<
    string[]
  >([]);
  const [expandedObjectMetadataIds, setExpandedObjectMetadataIds] = useState<
    string[]
  >([]);

  const { objectMetadataItemsThatCanHavePermission } =
    useObjectMetadataItemsThatCanHavePermission();

  const { filterObjectMetadataItemsWithPermissionOverride } =
    useFilterObjectMetadataItemsWithPermissionOverride({ roleId });

  const { resetObjectPermission } = useResetObjectPermission(roleId);

  const overriddenObjectMetadataItems =
    objectMetadataItemsThatCanHavePermission.filter(
      (objectMetadataItem) =>
        addedObjectMetadataIds.includes(objectMetadataItem.id) ||
        filterObjectMetadataItemsWithPermissionOverride(objectMetadataItem),
    );

  const addableObjectMetadataItems =
    objectMetadataItemsThatCanHavePermission.filter(
      (objectMetadataItem) =>
        !overriddenObjectMetadataItems.includes(objectMetadataItem),
    );

  const toggleExpanded = (objectMetadataId: string) => {
    setExpandedObjectMetadataIds((currentIds) =>
      currentIds.includes(objectMetadataId)
        ? currentIds.filter((id) => id !== objectMetadataId)
        : [...currentIds, objectMetadataId],
    );
  };

  const handleAddObject = (objectMetadataId: string) => {
    setAddedObjectMetadataIds((currentIds) => [
      ...currentIds,
      objectMetadataId,
    ]);
    setExpandedObjectMetadataIds((currentIds) => [
      ...currentIds,
      objectMetadataId,
    ]);
  };

  const handleRemoveObject = (objectMetadataId: string) => {
    resetObjectPermission(objectMetadataId);
    setAddedObjectMetadataIds((currentIds) =>
      currentIds.filter((id) => id !== objectMetadataId),
    );
    setExpandedObjectMetadataIds((currentIds) =>
      currentIds.filter((id) => id !== objectMetadataId),
    );
  };

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
                  isExpanded={expandedObjectMetadataIds.includes(
                    objectMetadataItem.id,
                  )}
                  onToggleExpanded={() => toggleExpanded(objectMetadataItem.id)}
                  onRemove={() => handleRemoveObject(objectMetadataItem.id)}
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
              onSelect={handleAddObject}
            />
          </TableFooter>
        )}
      </StyledOverridesTable>
    </Section.Root>
  );
};
