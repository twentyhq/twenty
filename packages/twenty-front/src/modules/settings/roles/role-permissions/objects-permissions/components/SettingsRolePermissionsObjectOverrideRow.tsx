import { isFieldPermissionRestrictive } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isFieldPermissionRestrictive';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectOverridePanel } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectOverridePanel';
import { OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/objects-permissions/constants/ObjectOverrideTableGridTemplateColumns';
import { useSettingsRoleObjectOverrides } from '@/settings/roles/role-permissions/objects-permissions/hooks/useSettingsRoleObjectOverrides';
import { getObjectOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectOperations';
import { getObjectOperationsSummary } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectOperationsSummary';
import { getObjectRowLevelPermissionPredicates } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectRowLevelPermissionPredicates';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsRoleExpandedObjectOverrideIdsFamilyState } from '@/settings/roles/states/settingsRoleExpandedObjectOverrideIdsFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledObjectName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 0;
`;

type SettingsRolePermissionsObjectOverrideRowProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectOverrideRow = ({
  roleId,
  objectMetadataItem,
  isEditable,
}: SettingsRolePermissionsObjectOverrideRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const settingsRoleExpandedObjectOverrideIds = useAtomFamilyStateValue(
    settingsRoleExpandedObjectOverrideIdsFamilyState,
    roleId,
  );
  const { toggleObjectOverrideExpanded } =
    useSettingsRoleObjectOverrides(roleId);

  const isExpanded = settingsRoleExpandedObjectOverrideIds.includes(
    objectMetadataItem.id,
  );

  const rulePredicates = getObjectRowLevelPermissionPredicates({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const hasFieldRestriction = (settingsDraftRole.fieldPermissions ?? []).some(
    (fieldPermission) =>
      fieldPermission.objectMetadataId === objectMetadataItem.id &&
      isFieldPermissionRestrictive(fieldPermission),
  );

  const operations = getObjectOperations({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const isAdvanced = rulePredicates.length > 0 || hasFieldRestriction;

  const { label, Icon: AccessIcon } = getObjectOperationsSummary({
    operations,
    isAdvanced,
  });

  const accessLabel = isAdvanced ? t`Advanced` : label;

  const ChevronIcon = isExpanded ? IconChevronUp : IconChevronDown;

  const handleToggleExpanded = () =>
    toggleObjectOverrideExpanded(objectMetadataItem.id);

  return (
    <Collapsible.Root open={isExpanded}>
      <TableRow
        gridTemplateColumns={OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS}
        isExpanded={isExpanded}
        onClick={handleToggleExpanded}
        ariaExpanded={isExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggleExpanded();
          }
        }}
      >
        <TableCell gap={themeCssVariables.spacing[2]} overflow="hidden">
          <ObjectMetadataIcon
            objectMetadataItem={objectMetadataItem}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
          <StyledObjectName>{objectMetadataItem.labelPlural}</StyledObjectName>
        </TableCell>
        <TableCell gap={themeCssVariables.spacing[1]}>
          <AccessIcon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
          {accessLabel}
        </TableCell>
        <TableCell align="right" color={themeCssVariables.font.color.tertiary}>
          <ChevronIcon size={theme.icon.size.md} />
        </TableCell>
      </TableRow>
      <Collapsible.Panel dimension="height" containAnimation={false}>
        <SettingsRolePermissionsObjectOverridePanel
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
          isEditable={isEditable}
        />
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
