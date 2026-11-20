import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectOperationsSelect } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOperationsSelect';
import { SettingsRolePermissionsObjectFieldsSelect } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectFieldsSelect';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-overrides/constants/ObjectOverrideTableGridTemplateColumns';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/object-overrides/hooks/useRowLevelPermissionRulesInDraftRole';
import { useObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/hooks/useObjectDisabledOperations';
import { useRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/object-overrides/hooks/useRowLevelPermissionRuleLabel';
import { useSettingsRoleObjectOverrides } from '@/settings/roles/role-permissions/object-overrides/hooks/useSettingsRoleObjectOverrides';
import { getObjectOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperations';
import { getObjectOperationsWithReadDependency } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperationsWithReadDependency';
import { getObjectRowLevelPermissionRules } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectRowLevelPermissionRules';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getRecordsGrantOperations';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight, IconPlus, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components/input';
import { Button, Checkbox } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  margin: ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledHeaderRow = styled.div`
  display: grid;
  grid-template-columns: ${OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS};
`;

const StyledActionLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 0;
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[1]};
`;

type SettingsRolePermissionsObjectOverridePanelProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectOverridePanel = ({
  roleId,
  objectMetadataItem,
  isEditable,
}: SettingsRolePermissionsObjectOverridePanelProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const theme = useTheme();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { removeObjectOverride, setObjectOperations } =
    useSettingsRoleObjectOverrides(roleId);

  const { createRule, setRuleOperations } =
    useRowLevelPermissionRulesInDraftRole(roleId);

  const { getRuleLabel } = useRowLevelPermissionRuleLabel(objectMetadataItem);

  const {
    disabledOperations,
    disabledOperationReasons,
    getDisabledOperationReason,
  } = useObjectDisabledOperations(objectMetadataItem);

  const rules = getObjectRowLevelPermissionRules({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const operations = getObjectOperations({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
    disabledOperations,
  });

  const objectLabelPlural = objectMetadataItem.labelPlural.toLocaleLowerCase();

  const getRuleOnlyHint = (operation: SettingsRoleObjectPermissionKey) => {
    const ruleCount = rules.filter(({ rule }) =>
      getRecordsGrantOperations({ recordsGrant: rule }).includes(operation),
    ).length;

    if (operations.includes(operation) || ruleCount === 0) {
      return null;
    }

    const throughRules =
      ruleCount === 1 ? t`through 1 rule` : t`through ${ruleCount} rules`;

    switch (operation) {
      case 'canReadObjectRecords':
        return t`See some ${objectLabelPlural} · ${throughRules}`;
      case 'canUpdateObjectRecords':
        return t`Edit some ${objectLabelPlural} · ${throughRules}`;
      case 'canSoftDeleteObjectRecords':
        return t`Delete some ${objectLabelPlural} · ${throughRules}`;
      case 'canDestroyObjectRecords':
        return t`Destroy some ${objectLabelPlural} · ${throughRules}`;
    }
  };

  const toggleOperation = (key: SettingsRoleObjectPermissionKey) => {
    const nextOperations = operations.includes(key)
      ? operations.filter((operation) => operation !== key)
      : [...operations, key];

    setObjectOperations({
      objectMetadataId: objectMetadataItem.id,
      operations: getObjectOperationsWithReadDependency({
        previousOperations: operations,
        nextOperations,
        disabledOperations,
      }),
    });
  };

  const openRulePage = (rowLevelPermissionRuleId: string) => {
    navigateSettings(
      SettingsPath.RoleRule,
      { roleId, objectMetadataId: objectMetadataItem.id },
      { rowLevelPermissionRuleId },
    );
  };

  return (
    <StyledPanel>
      <StyledHeaderRow>
        <TableHeader>{t`All records`}</TableHeader>
        <TableHeader>{t`Allows`}</TableHeader>
        <TableHeader align="right">
          {isEditable && (
            <LightIconButton
              emphasis="subtle"
              aria-label={t`Remove override`}
              onClick={() => removeObjectOverride(objectMetadataItem.id)}
            >
              <IconTrash />
            </LightIconButton>
          )}
        </TableHeader>
      </StyledHeaderRow>
      {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((key) => {
        const { Icon } = SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key];
        const disabledReason = getDisabledOperationReason(key);
        const isOperationEnabled = !isDefined(disabledReason);
        const hint = disabledReason ?? getRuleOnlyHint(key);

        return (
          <TableRow
            key={key}
            gridTemplateColumns={OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS}
            onClick={
              isEditable && isOperationEnabled
                ? () => toggleOperation(key)
                : undefined
            }
          >
            <TableCell gap={themeCssVariables.spacing[2]} overflow="hidden">
              <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
              <StyledActionLabel>
                {t(SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key].label)}
              </StyledActionLabel>
              {isDefined(hint) && (
                <OverflowingTextWithTooltip
                  color="tertiary"
                  text={`· ${hint}`}
                />
              )}
            </TableCell>
            <TableCell onClick={(event) => event.stopPropagation()}>
              {(key === 'canReadObjectRecords' ||
                key === 'canUpdateObjectRecords') && (
                <SettingsRolePermissionsObjectFieldsSelect
                  roleId={roleId}
                  objectMetadataItem={objectMetadataItem}
                  mode={key === 'canReadObjectRecords' ? 'read' : 'update'}
                  disabled={!isEditable || !operations.includes(key)}
                />
              )}
            </TableCell>
            <TableCell align="right">
              <Checkbox
                aria-label={t(
                  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key].label,
                )}
                checked={operations.includes(key)}
                disabled={!isEditable || !isOperationEnabled}
                hoverable={false}
                onClick={(event) => event.stopPropagation()}
                onCheckedChange={() => toggleOperation(key)}
              />
            </TableCell>
          </TableRow>
        );
      })}
      {rules.length > 0 && (
        <StyledHeaderRow>
          <TableHeader>{t`Some records`}</TableHeader>
          <TableHeader>{t`Allows`}</TableHeader>
          <TableHeader />
        </StyledHeaderRow>
      )}
      {rules.map(({ rule, predicates }) => {
        const ruleLabel = getRuleLabel(predicates);

        return (
          <TableRow
            key={rule.id}
            gridTemplateColumns={OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS}
            onClick={isEditable ? () => openRulePage(rule.id) : undefined}
          >
            <TableCell
              color={
                isNonEmptyString(ruleLabel)
                  ? themeCssVariables.font.color.primary
                  : themeCssVariables.font.color.tertiary
              }
              overflow="hidden"
            >
              <OverflowingTextWithTooltip
                text={isNonEmptyString(ruleLabel) ? ruleLabel : t`No condition`}
              />
            </TableCell>
            <TableCell onClick={(event) => event.stopPropagation()}>
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
            </TableCell>
            <TableCell
              align="right"
              color={themeCssVariables.font.color.tertiary}
            >
              {isEditable && <IconChevronRight size={theme.icon.size.md} />}
            </TableCell>
          </TableRow>
        );
      })}
      {isEditable && (
        <StyledFooter>
          <Button
            size="sm"
            variant="outline"
            startIcon={<IconPlus />}
            onClick={() => openRulePage(createRule(objectMetadataItem.id))}
          >
            {t`New rule`}
          </Button>
        </StyledFooter>
      )}
    </StyledPanel>
  );
};
