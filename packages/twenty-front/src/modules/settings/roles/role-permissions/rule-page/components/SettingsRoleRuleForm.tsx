import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/object-overrides/hooks/useRowLevelPermissionRulesInDraftRole';
import { SettingsRoleRuleAllowsSection } from '@/settings/roles/role-permissions/rule-page/components/SettingsRoleRuleAllowsSection';
import { SettingsRoleRuleConditionsSection } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionsSection';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
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
import { IconCheck, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
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
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromAgentId = searchParams.get('fromAgent');
  const rowLevelPermissionRuleId = searchParams.get('rowLevelPermissionRuleId');

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
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

  const objectLabelPlural = objectMetadataItem.labelPlural;

  const agent = agentData?.findOneAgent;

  const finishButtonPath =
    fromAgentId && isDefined(agent)
      ? getCoreAgentLink(agent.id)
      : getSettingsPath(SettingsPath.RoleDetail, { roleId });

  const rule = settingsDraftRole.rowLevelPermissionRules?.find(
    (draftRule) =>
      draftRule.id === rowLevelPermissionRuleId &&
      draftRule.objectMetadataId === objectMetadataItem.id,
  );

  if (!isDefined(rule)) {
    return <Navigate to={finishButtonPath} replace />;
  }

  const isRuleSaved = (
    settingsPersistedRole?.rowLevelPermissionRules ?? []
  ).some((persistedRule) => persistedRule.id === rule.id);

  const ruleBreadcrumbLinks = [
    { children: objectLabelPlural },
    { children: isRuleSaved ? t`Rule` : t`New rule` },
  ];

  const breadcrumbLinks =
    fromAgentId && isDefined(agent)
      ? getCoreAgentBreadcrumbLinks([
          { children: agent.label, href: getCoreAgentLink(agent.id) },
          ...ruleBreadcrumbLinks,
        ])
      : [
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
          ...ruleBreadcrumbLinks,
        ];

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
      title={objectLabelPlural}
      icon={
        <ObjectMetadataIcon
          objectMetadataItem={objectMetadataItem}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      }
      links={breadcrumbLinks}
      secondaryBar={
        <SettingsWizardStepBar
          label={t`Row-level permission`}
          onBack={handleBack}
          trailing={
            <StyledTrailingActions>
              {isRuleSaved && (
                <Button
                  size="sm"
                  variant="outline"
                  startIcon={<IconTrash />}
                  onClick={handleDeleteRule}
                >{t`Delete rule`}</Button>
              )}
              <NavigationButton
                size="sm"
                to={finishButtonPath}
                disabled={isFinishDisabled}
                variant="solid"
                color="accent"
                startIcon={<IconCheck />}
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
        {isRLSBillingEntitlementEnabled && (
          <SettingsRoleRuleAllowsSection
            roleId={roleId}
            objectMetadataItem={objectMetadataItem}
            rule={rule}
          />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
