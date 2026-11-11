import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWizardStepBar } from '@/settings/components/layout/SettingsWizardStepBar';
import { getRulePredicateGroupIds } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getRulePredicateGroupIds';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { SettingsRolePermissionsObjectLevelRecordLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelSection';
import { SettingsRolePermissionsObjectActionsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectActionsSelect';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/objects-permissions/hooks/useRowLevelPermissionRulesInDraftRole';
import { getRuleGrantedKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getRuleGrantedKeys';
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
import { IconFilter, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  BillingEntitlementKey,
  FindOneAgentDocument,
} from '~/generated-metadata/graphql';

const RULE_ACTIONS_SELECT_WIDTH = 240;

type SettingsRolePermissionsObjectLevelObjectFormProps = {
  roleId: string;
  objectMetadataId: string;
};

export const SettingsRolePermissionsObjectLevelObjectForm = ({
  roleId,
  objectMetadataId,
}: SettingsRolePermissionsObjectLevelObjectFormProps) => {
  const { t } = useLingui();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromAgentId = searchParams.get('fromAgent');
  const ruleRootGroupId = searchParams.get('ruleId');

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { setRuleGrantedKeys, deleteRule } =
    useRowLevelPermissionRulesInDraftRole(roleId);

  const { data: agentData } = useQuery(FindOneAgentDocument, {
    variables: { id: fromAgentId || '' },
    skip: !fromAgentId,
  });

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const isRLSBillingEntitlementEnabled =
    checkIfBillingEntitlementIsEnabledOnWorkspace(
      BillingEntitlementKey.RLS,
      currentWorkspace,
    );

  const agent = agentData?.findOneAgent;
  const objectLabelSingular = objectMetadataItem.labelSingular;
  const objectLabelPlural = objectMetadataItem.labelPlural;

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

  const breadcrumbLinks =
    fromAgentId && isDefined(agent)
      ? getCoreAgentBreadcrumbLinks([
          { children: agent.label, href: getCoreAgentLink(agent.id) },
          { children: t`Permissions · ${objectLabelSingular} rule` },
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
            href: rolePath,
          },
          {
            children: t`Permissions · ${objectLabelSingular} rule`,
          },
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

  const headerTitle =
    fromAgentId && isDefined(agent) ? agent.label : settingsDraftRole.label;

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
            <NavigationButton
              size="sm"
              to={finishPath}
              disabled={hasInvalidPredicate || isRuleEmpty}
              variant="solid"
              color="accent"
            >{t`Finish`}</NavigationButton>
          }
        />
      }
    >
      <SettingsPageContainer>
        <SettingsRolePermissionsObjectLevelRecordLevelSection
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
          ruleRootGroupId={ruleRootGroupId}
          hasOrganizationPlan={isRLSBillingEntitlementEnabled}
        />
        <Section.Root>
          <Section.Header
            title={t`Allows`}
            description={t`What this role can do on matching ${objectLabelPlural}`}
          />
          <StyledSettingsSelectGroup controlWidth={RULE_ACTIONS_SELECT_WIDTH}>
            <Card.Root>
              <SettingsOptionCardContentSelect
                Icon={IconFilter}
                title={t`Matching records`}
                description={t`Adds to what all records allow`}
              >
                <SettingsRolePermissionsObjectActionsSelect
                  dropdownId={`settings-role-rule-editor-actions-${ruleRootGroupId}`}
                  selectedKeys={getRuleGrantedKeys(rootPredicateGroup)}
                  onChange={(selectedKeys) =>
                    setRuleGrantedKeys({
                      rootPredicateGroupId: ruleRootGroupId,
                      grantedKeys: selectedKeys,
                    })
                  }
                  disabled={!settingsDraftRole.isEditable}
                />
              </SettingsOptionCardContentSelect>
            </Card.Root>
          </StyledSettingsSelectGroup>
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
