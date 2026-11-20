import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/object-overrides/hooks/useRowLevelPermissionRulesInDraftRole';
import { SettingsRoleRuleConditionsSection } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionsSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWizardStepBar } from '@/settings/components/layout/SettingsWizardStepBar';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isRecordFilterValueValid,
  mapRLSOperandToRecordFilterOperand,
} from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useQuery } from '@apollo/client/react';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import {
  BillingEntitlementKey,
  FindOneAgentDocument,
} from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

const StyledTrailingActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsRoleRuleFormProps = {
  roleId: string;
  objectMetadataId: string;
};

export const SettingsRoleRuleForm = ({
  roleId,
  objectMetadataId,
}: SettingsRoleRuleFormProps) => {
  const { t } = useLingui();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromAgentId = searchParams.get('fromAgent');
  const rowLevelPermissionRuleId = searchParams.get('rowLevelPermissionRuleId');

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { deleteRule } = useRowLevelPermissionRulesInDraftRole(roleId);

  const { data: agentData } = useQuery(FindOneAgentDocument, {
    variables: { id: fromAgentId || '' },
    skip: !fromAgentId,
  });

  const objectMetadata = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const isRLSBillingEntitlementEnabled =
    checkIfBillingEntitlementIsEnabledOnWorkspace(
      BillingEntitlementKey.RLS,
      currentWorkspace,
    );

  const objectMetadataItem = objectMetadata.objectMetadataItem;

  const objectLabelSingular = objectMetadataItem.labelSingular;
  const objectLabelPlural = objectMetadataItem.labelPlural;

  const agent = agentData?.findOneAgent;

  const breadcrumbLinks =
    fromAgentId && isDefined(agent)
      ? getCoreAgentBreadcrumbLinks([
          { children: agent.label, href: getCoreAgentLink(agent.id) },
          { children: t`Permissions · ${objectLabelSingular}` },
        ])
      : [
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.General),
          },
          {
            children: t`Members`,
            href: getSettingsPath(SettingsPath.WorkspaceMembersPage),
          },
          {
            children: t`Roles`,
            href: getSettingsPath(SettingsPath.Roles),
          },
          {
            children: settingsDraftRole.label,
            href: getSettingsPath(SettingsPath.RoleDetail, {
              roleId,
            }),
          },
          {
            children: t`Permissions · ${objectLabelSingular}`,
          },
        ];

  const finishButtonPath =
    fromAgentId && isDefined(agent)
      ? getCoreAgentLink(agent.id)
      : getSettingsPath(SettingsPath.RoleDetail, { roleId });

  const headerTitle =
    fromAgentId && isDefined(agent) ? agent.label : settingsDraftRole.label;

  const rule = settingsDraftRole.rowLevelPermissionRules?.find(
    (draftRule) =>
      draftRule.id === rowLevelPermissionRuleId &&
      draftRule.objectMetadataId === objectMetadataItem.id,
  );

  if (!isDefined(rule)) {
    return <Navigate to={finishButtonPath} replace />;
  }

  const rulePredicates =
    settingsDraftRole.rowLevelPermissionPredicates?.filter(
      (predicate) => predicate.rowLevelPermissionRuleId === rule.id,
    ) ?? [];

  const hasInvalidPredicate = rulePredicates.some((predicate) => {
    if (isDefined(predicate.workspaceMemberFieldMetadataId)) {
      return false;
    }

    return !isRecordFilterValueValid({
      operand: mapRLSOperandToRecordFilterOperand(predicate.operand),
      value: predicate.value ?? '',
    });
  });

  const isFinishDisabled = rulePredicates.length === 0 || hasInvalidPredicate;

  const handleDeleteRule = () => {
    deleteRule(rule.id);
    navigate(finishButtonPath);
  };

  const handleBack = () => {
    if (rulePredicates.length === 0) {
      deleteRule(rule.id);
    }
    navigate(finishButtonPath);
  };

  return (
    <SettingsPageLayout
      title={headerTitle}
      titleColor={themeCssVariables.font.color.tertiary}
      links={breadcrumbLinks}
      secondaryBar={
        <SettingsWizardStepBar
          label={t`${objectLabelPlural} rule`}
          onBack={handleBack}
          trailing={
            <StyledTrailingActions>
              <Button
                size="sm"
                variant="outline"
                startIcon={<IconTrash />}
                onClick={handleDeleteRule}
              >{t`Delete rule`}</Button>
              <NavigationButton
                size="sm"
                to={finishButtonPath}
                disabled={isFinishDisabled}
                variant="solid"
                color="accent"
              >{t`Finish`}</NavigationButton>
            </StyledTrailingActions>
          }
        />
      }
    >
      <SettingsPageContainer>
        <SettingsRoleRuleConditionsSection
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
          rowLevelPermissionRuleId={rule.id}
          hasOrganizationPlan={isRLSBillingEntitlementEnabled}
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
