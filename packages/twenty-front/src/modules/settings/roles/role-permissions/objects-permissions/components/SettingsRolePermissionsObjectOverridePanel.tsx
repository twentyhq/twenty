import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectActionsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectActionsSelect';
import { SettingsRolePermissionsObjectFieldsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectFieldsSelect';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/objects-permissions/constants/ObjectOverrideTableGridTemplateColumns';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/objects-permissions/hooks/useRowLevelPermissionRulesInDraftRole';
import { useSettingsRoleObjectOverrides } from '@/settings/roles/role-permissions/objects-permissions/hooks/useSettingsRoleObjectOverrides';
import { getObjectOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectOperations';
import { getObjectOperationsWithReadDependency } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectOperationsWithReadDependency';
import { getObjectRowLevelPermissionRules } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectRowLevelPermissionRules';
import { getRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getRowLevelPermissionRuleLabel';
import { getRecordsGrantOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getRecordsGrantOperations';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { IconChevronRight, IconPlus } from 'twenty-ui/icon';
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

  const { objectMetadataItem: workspaceMemberObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: StandardObjectNameSingular.WorkspaceMember,
    });

  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const workspaceMemberNameById = new Map(
    currentWorkspaceMembers.map(({ id, name }) => [
      id,
      [name.firstName, name.lastName].filter(isNonEmptyString).join(' '),
    ]),
  );

  const rules = getObjectRowLevelPermissionRules({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const operations = getObjectOperations({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const toggleOperation = (key: SettingsRoleObjectPermissionKey) => {
    const nextOperations = operations.includes(key)
      ? operations.filter((operation) => operation !== key)
      : [...operations, key];

    setObjectOperations({
      objectMetadataId: objectMetadataItem.id,
      operations: getObjectOperationsWithReadDependency({
        previousOperations: operations,
        nextOperations,
      }),
    });
  };

  const openRulePage = (rowLevelPermissionRuleId: string) => {
    navigateSettings(
      SettingsPath.RoleObjectLevel,
      { roleId, objectMetadataId: objectMetadataItem.id },
      { rowLevelPermissionRuleId },
    );
  };

  return (
    <StyledPanel>
      <StyledHeaderRow>
        <TableHeader>{t`All records`}</TableHeader>
        <TableHeader />
        <TableHeader align="right">{t`Allows`}</TableHeader>
      </StyledHeaderRow>
      {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((key) => {
        const { Icon } = SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key];

        return (
          <TableRow
            key={key}
            gridTemplateColumns={OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS}
            onClick={isEditable ? () => toggleOperation(key) : undefined}
          >
            <TableCell gap={themeCssVariables.spacing[2]}>
              <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
              <StyledActionLabel>
                {t(SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key].label)}
              </StyledActionLabel>
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
                disabled={!isEditable}
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
        </StyledHeaderRow>
      )}
      {rules.map(({ rule, predicates }) => {
        const ruleLabel = getRowLevelPermissionRuleLabel({
          predicates,
          objectMetadataItem,
          workspaceMemberObjectMetadataItem,
          recordLabelById: workspaceMemberNameById,
        });

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
              <SettingsRolePermissionsObjectActionsSelect
                dropdownId={`settings-role-rule-actions-${rule.id}`}
                selectedOperations={getRecordsGrantOperations(rule)}
                onChange={(operations) =>
                  setRuleOperations({
                    rowLevelPermissionRuleId: rule.id,
                    operations,
                  })
                }
                disabled={!isEditable}
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
            onClick={() => removeObjectOverride(objectMetadataItem.id)}
          >
            {t`Remove override`}
          </Button>
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
