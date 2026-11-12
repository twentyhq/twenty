import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWizardStepBar } from '@/settings/components/layout/SettingsWizardStepBar';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder';
import { getRulePredicateGroupIds } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getRulePredicateGroupIds';
import { SettingsRolePermissionsRuleAllowsCard } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsRuleAllowsCard';
import { SettingsRolePermissionsRuleFieldsCard } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsRuleFieldsCard';
import { SettingsRolePermissionsRuleUpgradeCard } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsRuleUpgradeCard';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/objects-permissions/hooks/useRowLevelPermissionRulesInDraftRole';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isRecordFilterValueValid,
  mapRLSOperandToRecordFilterOperand,
} from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconCheck, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';
import {
  BillingEntitlementKey,
  FindOneAgentDocument,
} from '~/generated-metadata/graphql';

type SettingsRolePermissionsObjectLevelObjectFormProps = {
  roleId: string;
  objectMetadataId: string;
};

export const SettingsRolePermissionsObjectLevelObjectForm = ({
  roleId,
  objectMetadataId,
}: SettingsRolePermissionsObjectLevelObjectFormProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromAgentId = searchParams.get('fromAgent');
  const ruleRootGroupId = searchParams.get('ruleId');

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

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const hasRowLevelPermissionEntitlement =
    checkIfBillingEntitlementIsEnabledOnWorkspace(
      BillingEntitlementKey.RLS,
      currentWorkspace,
    );

  const agent = agentData?.findOneAgent;
  const roleLabel = settingsDraftRole.label;
  const objectLabelPlural = objectMetadataItem.labelPlural;
  const objectLabelPluralLowercase = objectLabelPlural.toLocaleLowerCase();

  const rolePath = getSettingsPath(SettingsPath.RoleDetail, { roleId });
  const finishPath =
    fromAgentId && isDefined(agent) ? getCoreAgentLink(agent.id) : rolePath;

  const rootPredicateGroup =
    settingsDraftRole.rowLevelPermissionPredicateGroups?.find(
      (predicateGroup) =>
        predicateGroup.id === ruleRootGroupId &&
        predicateGroup.objectMetadataId === objectMetadataId,
    );

  const isDraftRoleSeeded = settingsDraftRole.id === roleId;

  if (!isDraftRoleSeeded) {
    return <SettingsRoleDraftSyncEffect roleId={roleId} />;
  }

  if (!isDefined(ruleRootGroupId) || !isDefined(rootPredicateGroup)) {
    return <Navigate to={finishPath} replace />;
  }

  const ruleCrumbLabel = isDefined(rootPredicateGroup.rowLevelPermissionRuleId)
    ? t`Rule`
    : t`New rule`;

  const breadcrumbLinks =
    fromAgentId && isDefined(agent)
      ? getCoreAgentBreadcrumbLinks([
          { children: agent.label, href: getCoreAgentLink(agent.id) },
          { children: objectLabelPlural },
          { children: ruleCrumbLabel },
        ])
      : [
          {
            children: t`Roles`,
            href: getSettingsPath(SettingsPath.Roles),
          },
          {
            children: roleLabel,
            href: rolePath,
          },
          { children: objectLabelPlural, href: rolePath },
          { children: ruleCrumbLabel },
        ];

  const rulePredicateGroupIds = getRulePredicateGroupIds({
    predicateGroups: settingsDraftRole.rowLevelPermissionPredicateGroups ?? [],
    ruleRootGroupId,
  });

  const rulePredicates =
    settingsDraftRole.rowLevelPermissionPredicates?.filter(
      (predicate) =>
        isDefined(predicate.rowLevelPermissionPredicateGroupId) &&
        rulePredicateGroupIds.has(predicate.rowLevelPermissionPredicateGroupId),
    ) ?? [];

  const isRuleEmpty = rulePredicates.length === 0;

  const hasInvalidPredicate = rulePredicates.some((predicate) => {
    if (isDefined(predicate.workspaceMemberFieldMetadataId)) {
      return false;
    }

    return !isRecordFilterValueValid({
      operand: mapRLSOperandToRecordFilterOperand(predicate.operand),
      value: predicate.value ?? '',
    });
  });

  const handleDeleteRule = () => {
    deleteRule(ruleRootGroupId);
    navigate(finishPath);
  };

  const handleBack = () => {
    if (isRuleEmpty) {
      deleteRule(ruleRootGroupId);
    }

    navigate(finishPath);
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
            <NavigationButton
              size="sm"
              to={finishPath}
              disabled={hasInvalidPredicate || isRuleEmpty}
              variant="solid"
              color="accent"
              startIcon={<IconCheck />}
            >{t`Finish`}</NavigationButton>
          }
        />
      }
    >
      <SettingsPageContainer>
        <Section.Root>
          <Section.Header
            title={t`Condition`}
            description={t`Which ${objectLabelPluralLowercase} this rule applies to. Me is the person viewing.`}
          />
          {hasRowLevelPermissionEntitlement ? (
            <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder
              roleId={roleId}
              objectMetadataItem={objectMetadataItem}
              ruleRootGroupId={ruleRootGroupId}
            />
          ) : (
            <SettingsRolePermissionsRuleUpgradeCard />
          )}
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Allows`}
            description={t`What ${roleLabel} can do on ${objectLabelPluralLowercase} matching this rule.`}
          />
          <SettingsRolePermissionsRuleAllowsCard
            roleId={roleId}
            objectMetadataItem={objectMetadataItem}
            ruleRootGroupId={ruleRootGroupId}
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Fields`}
            description={t`Fields ${roleLabel} can see and edit on ${objectLabelPluralLowercase} matching this rule.`}
          />
          <SettingsRolePermissionsRuleFieldsCard
            roleId={roleId}
            objectMetadataItem={objectMetadataItem}
            ruleRootGroupId={ruleRootGroupId}
          />
        </Section.Root>
        {settingsDraftRole.isEditable && (
          <Section.Root>
            <Button
              size="sm"
              variant="outline"
              color="danger"
              startIcon={<IconTrash />}
              onClick={handleDeleteRule}
            >{t`Delete rule`}</Button>
          </Section.Root>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
