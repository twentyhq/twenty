import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectOperationsSelect } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOperationsSelect';
import { SettingsRolePermissionsObjectOverrideActionContainer } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOverrideActionContainer';
import { SettingsRolePermissionsObjectOverrideSelectContainer } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOverrideSelectContainer';
import { OBJECT_OVERRIDE_PANEL_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-overrides/constants/ObjectOverridePanelGridTemplateColumns';
import { useObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/hooks/useObjectDisabledOperations';
import { useOpenRowLevelPermissionRulePage } from '@/settings/roles/role-permissions/object-overrides/hooks/useOpenRowLevelPermissionRulePage';
import { useRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/object-overrides/hooks/useRowLevelPermissionRuleLabel';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/object-overrides/hooks/useRowLevelPermissionRulesInDraftRole';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRecordsGrantOperations';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconChevronRight } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionRule,
} from '~/generated-metadata/graphql';

type SettingsRolePermissionsObjectOverrideRuleRowProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  rule: RowLevelPermissionRule;
  predicates: RowLevelPermissionPredicate[];
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectOverrideRuleRow = ({
  roleId,
  objectMetadataItem,
  rule,
  predicates,
  isEditable,
}: SettingsRolePermissionsObjectOverrideRuleRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getRuleLabel } = useRowLevelPermissionRuleLabel(objectMetadataItem);
  const { setRuleOperations } = useRowLevelPermissionRulesInDraftRole(roleId);
  const { disabledOperations, disabledOperationReasons } =
    useObjectDisabledOperations(objectMetadataItem);
  const { openRowLevelPermissionRulePage } = useOpenRowLevelPermissionRulePage({
    roleId,
    objectMetadataId: objectMetadataItem.id,
  });

  const ruleLabel = getRuleLabel(predicates);
  const hasRuleLabel = isNonEmptyString(ruleLabel);

  return (
    <TableRow
      gridTemplateColumns={OBJECT_OVERRIDE_PANEL_GRID_TEMPLATE_COLUMNS}
      onClick={
        isEditable ? () => openRowLevelPermissionRulePage(rule.id) : undefined
      }
    >
      <TableCell
        color={
          hasRuleLabel
            ? themeCssVariables.font.color.primary
            : themeCssVariables.font.color.tertiary
        }
        overflow="hidden"
      >
        <OverflowingTextWithTooltip
          text={hasRuleLabel ? ruleLabel : t`No condition`}
        />
      </TableCell>
      <TableCell
        padding={`0 0 0 ${themeCssVariables.spacing[2]}`}
        onClick={(event) => event.stopPropagation()}
      >
        <SettingsRolePermissionsObjectOverrideSelectContainer>
          <SettingsRolePermissionsObjectOperationsSelect
            dropdownId={`settings-role-rule-actions-${rule.id}`}
            selectedOperations={getRecordsGrantOperations({
              recordsGrant: rule,
              disabledOperations,
            })}
            onChange={(operations) =>
              setRuleOperations({
                rowLevelPermissionRuleId: rule.id,
                operations,
              })
            }
            disabled={!isEditable}
            disabledOperationReasons={disabledOperationReasons}
          />
        </SettingsRolePermissionsObjectOverrideSelectContainer>
      </TableCell>
      <TableCell
        align="right"
        color={themeCssVariables.font.color.tertiary}
        padding={`0 ${themeCssVariables.spacing[1]} 0 0`}
      >
        {isEditable && (
          <SettingsRolePermissionsObjectOverrideActionContainer>
            <IconChevronRight size={theme.icon.size.md} />
          </SettingsRolePermissionsObjectOverrideActionContainer>
        )}
      </TableCell>
    </TableRow>
  );
};
