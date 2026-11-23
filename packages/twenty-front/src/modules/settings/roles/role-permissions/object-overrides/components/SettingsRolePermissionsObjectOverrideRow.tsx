import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectOverridePanel } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOverridePanel';
import { OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-overrides/constants/ObjectOverrideTableGridTemplateColumns';
import { useRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/object-overrides/hooks/useRowLevelPermissionRuleLabel';
import { useSettingsRoleObjectOverrides } from '@/settings/roles/role-permissions/object-overrides/hooks/useSettingsRoleObjectOverrides';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRecordsGrantOperations';
import { getObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectDisabledOperations';
import { getObjectOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperations';
import { getObjectRowLevelPermissionRules } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectRowLevelPermissionRules';
import { hasObjectFieldRestriction } from '@/settings/roles/role-permissions/object-overrides/utils/hasObjectFieldRestriction';
import { getObjectOperationsSummary } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperationsSummary';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsRoleExpandedObjectOverrideIdsFamilyState } from '@/settings/roles/states/settingsRoleExpandedObjectOverrideIdsFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { isDefined } from 'twenty-shared/utils';
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

  const { getRuleLabel } = useRowLevelPermissionRuleLabel(objectMetadataItem);

  const rules = getObjectRowLevelPermissionRules({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const hasRule = rules.length > 0;

  const hasFieldRestriction = hasObjectFieldRestriction({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const disabledOperations = getObjectDisabledOperations(objectMetadataItem);

  const operations = getObjectOperations({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
    disabledOperations,
  });

  const isAdvanced = hasRule || hasFieldRestriction;

  const { label, Icon: AccessIcon } = getObjectOperationsSummary({
    operations,
    isAdvanced,
  });

  const accessLabel = isAdvanced ? t`Advanced` : label;

  const getRulesHint = () => {
    if (rules.length > 1) {
      return t`${rules.length} rules`;
    }

    const [singleRule] = rules;

    if (!isDefined(singleRule)) {
      return null;
    }

    const ruleOperationsLabel = getObjectOperationsSummary({
      operations: getRecordsGrantOperations({
        recordsGrant: singleRule.rule,
        disabledOperations,
      }),
      isAdvanced: false,
    }).label;
    const ruleLabel = getRuleLabel(singleRule.predicates);

    return t`${ruleOperationsLabel} when ${ruleLabel}`;
  };

  const rulesHint = getRulesHint();

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
          {isDefined(rulesHint) && (
            <OverflowingTextWithTooltip
              color="tertiary"
              text={`· ${rulesHint}`}
            />
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
      <Collapsible.Panel dimension="height">
        <SettingsRolePermissionsObjectOverridePanel
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
          isEditable={isEditable}
        />
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
