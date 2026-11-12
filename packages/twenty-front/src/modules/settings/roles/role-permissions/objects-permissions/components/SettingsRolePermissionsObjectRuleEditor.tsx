import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder';
import { SettingsRolePermissionsObjectFieldsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectFieldsSelect';
import { OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/objects-permissions/constants/ObjectOverrideTableGridTemplateColumns';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';
import { SettingsRolePermissionsRuleUpgradeCard } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsRuleUpgradeCard';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/objects-permissions/hooks/useRowLevelPermissionRulesInDraftRole';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { BillingEntitlementKey } from '~/generated-metadata/graphql';

const StyledRuleEditor = styled.div`
  border-left: 2px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin: ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[3]};
`;

const StyledFieldsRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: ${OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS};
  justify-items: start;
`;

const StyledFieldsLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
`;

const RULE_FIELD_MODES = ['read', 'update'] as const;

const StyledActions = styled.div`
  display: flex;
`;

type SettingsRolePermissionsObjectRuleEditorProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  ruleRootGroupId: string;
};

export const SettingsRolePermissionsObjectRuleEditor = ({
  roleId,
  objectMetadataItem,
  ruleRootGroupId,
}: SettingsRolePermissionsObjectRuleEditorProps) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { deleteRule } = useRowLevelPermissionRulesInDraftRole(roleId);
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const rootPredicateGroup =
    settingsDraftRole.rowLevelPermissionPredicateGroups?.find(
      (predicateGroup) => predicateGroup.id === ruleRootGroupId,
    );

  const hasRowLevelPermissionEntitlement =
    checkIfBillingEntitlementIsEnabledOnWorkspace(
      BillingEntitlementKey.RLS,
      currentWorkspace,
    );

  return (
    <StyledRuleEditor>
      {hasRowLevelPermissionEntitlement ? (
        <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
          ruleRootGroupId={ruleRootGroupId}
        />
      ) : (
        <SettingsRolePermissionsRuleUpgradeCard />
      )}
      {hasRowLevelPermissionEntitlement &&
        RULE_FIELD_MODES.map((mode) => (
          <StyledFieldsRow key={mode}>
            <StyledFieldsLabel>
              {mode === 'read' ? t`Fields to see` : t`Fields to edit`}
            </StyledFieldsLabel>
            <SettingsRolePermissionsObjectFieldsSelect
              roleId={roleId}
              objectMetadataItem={objectMetadataItem}
              mode={mode}
              ruleRootGroupId={ruleRootGroupId}
              disabled={
                !isDefined(rootPredicateGroup) ||
                (mode === 'read'
                  ? !rootPredicateGroup.canReadRecords
                  : !rootPredicateGroup.canUpdateRecords)
              }
            />
          </StyledFieldsRow>
        ))}
      <StyledActions>
        <Button
          size="sm"
          variant="outline"
          color="danger"
          startIcon={<IconTrash />}
          onClick={() => deleteRule(ruleRootGroupId)}
        >{t`Delete rule`}</Button>
      </StyledActions>
    </StyledRuleEditor>
  );
};
