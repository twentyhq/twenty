import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectOverridePanel } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectOverridePanel';
import { SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { getGrantedObjectPermissionKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getGrantedObjectPermissionKeys';
import { getObjectPermissionActionsLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionActionsLabel';
import { getRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getRowLevelPermissionRuleLabel';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  IconAdjustments,
  IconChevronDown,
  IconChevronUp,
  IconEyeOff,
} from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

export const OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS = '1fr 1fr 36px';

const StyledObjectName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 0;
`;

const StyledRuleLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  min-width: 0;
  overflow: hidden;
`;

type SettingsRolePermissionsObjectOverrideRowProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  isEditable: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onRemove: () => void;
  fromAgentId?: string;
};

export const SettingsRolePermissionsObjectOverrideRow = ({
  roleId,
  objectMetadataItem,
  isEditable,
  isExpanded,
  onToggleExpanded,
  onRemove,
  fromAgentId,
}: SettingsRolePermissionsObjectOverrideRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const predicates =
    settingsDraftRole.rowLevelPermissionPredicates?.filter(
      (predicate) => predicate.objectMetadataId === objectMetadataItem.id,
    ) ?? [];

  const hasFieldRestriction = (settingsDraftRole.fieldPermissions ?? []).some(
    (fieldPermission) =>
      fieldPermission.objectMetadataId === objectMetadataItem.id &&
      (fieldPermission.canReadFieldValue === false ||
        fieldPermission.canUpdateFieldValue === false),
  );

  const grantedKeys = getGrantedObjectPermissionKeys({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const isAdvanced = predicates.length > 0 || hasFieldRestriction;
  const highestGrantedKey = grantedKeys.at(-1);

  const AccessIcon = isAdvanced
    ? IconAdjustments
    : highestGrantedKey === undefined
      ? IconEyeOff
      : SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[highestGrantedKey].Icon;

  const accessLabel = isAdvanced
    ? t`Advanced`
    : getObjectPermissionActionsLabel(grantedKeys);

  const ruleLabel = getRowLevelPermissionRuleLabel({
    predicates,
    objectMetadataItem,
  });

  const ChevronIcon = isExpanded ? IconChevronUp : IconChevronDown;

  return (
    <Collapsible.Root open={isExpanded}>
      <TableRow
        gridTemplateColumns={OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS}
        isExpanded={isExpanded}
        onClick={onToggleExpanded}
        ariaExpanded={isExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggleExpanded();
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
          {isNonEmptyString(ruleLabel) && (
            <StyledRuleLabel>
              <OverflowingTextWithTooltip text={`· ${ruleLabel}`} />
            </StyledRuleLabel>
          )}
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
          ruleLabel={ruleLabel}
          onRemove={onRemove}
          fromAgentId={fromAgentId}
        />
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
