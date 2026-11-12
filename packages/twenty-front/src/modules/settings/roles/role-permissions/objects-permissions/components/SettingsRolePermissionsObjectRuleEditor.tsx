import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder';
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
