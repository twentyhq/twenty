import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { mapRLSOperandToRecordFilterOperand } from '@/object-record/record-filter/utils/mapRLSOperandToRecordFilterOperand';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolePermissionsObjectLevelObjectFieldPermissionTable } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelObjectFieldPermissionTable';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevel } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevel';
import { SettingsRolePermissionsObjectLevelRecordLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWizardStepBar } from '@/settings/components/layout/SettingsWizardStepBar';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isRecordFilterValueValid,
} from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import {
  type BillingEntitlement,
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromAgentId = searchParams.get('fromAgent');

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { data: agentData } = useQuery(FindOneAgentDocument, {
    variables: { id: fromAgentId || '' },
    skip: !fromAgentId,
  });

  const objectMetadata = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const workspaceBillingEntitlements = currentWorkspace?.billingEntitlements;

  const isRLSBillingEntitlementEnabled =
    workspaceBillingEntitlements?.some(
      (entitlement: BillingEntitlement) =>
        entitlement.key === BillingEntitlementKey.RLS &&
        entitlement.value === true,
    ) ?? false;

  const objectMetadataItem = objectMetadata.objectMetadataItem;

  const objectLabelSingular = objectMetadataItem.labelSingular;
  const objectLabelPlural = objectMetadataItem.labelPlural;

  const agent = agentData?.findOneAgent;

  const breadcrumbLinks =
    fromAgentId && isDefined(agent)
      ? [
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.General),
          },
          {
            children: t`AI`,
            href: getSettingsPath(SettingsPath.AI),
          },
          {
            children: agent.label,
            href: getSettingsPath(SettingsPath.AiAgentDetail, {
              agentId: agent.id,
            }),
          },
          {
            children: t`Permissions · ${objectLabelSingular}`,
          },
        ]
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
      ? getSettingsPath(SettingsPath.AiAgentDetail, { agentId: agent.id })
      : getSettingsPath(SettingsPath.RoleDetail, { roleId });

  const previousStepPath = `${getSettingsPath(SettingsPath.RoleAddObjectLevel, {
    roleId,
  })}${fromAgentId ? `?fromAgent=${fromAgentId}` : ''}`;

  const headerTitle =
    fromAgentId && isDefined(agent) ? agent.label : settingsDraftRole.label;

  const objectPredicates =
    settingsDraftRole.rowLevelPermissionPredicates?.filter(
      (predicate) => predicate.objectMetadataId === objectMetadataItem.id,
    ) ?? [];

  const hasInvalidPredicate = objectPredicates.some((predicate) => {
    if (isDefined(predicate.workspaceMemberFieldMetadataId)) {
      return false;
    }

    return !isRecordFilterValueValid({
      operand: mapRLSOperandToRecordFilterOperand(predicate.operand),
      value: predicate.value ?? '',
    });
  });

  const isFinishDisabled = hasInvalidPredicate;

  return (
    <SettingsPageLayout
      title={headerTitle}
      titleColor={themeCssVariables.font.color.tertiary}
      links={breadcrumbLinks}
      secondaryBar={
        <SettingsWizardStepBar
          label={t`2. Set ${objectLabelPlural} permissions`}
          onBack={() => navigate(previousStepPath)}
          trailing={
            <Button
              title={t`Finish`}
              variant="primary"
              size="small"
              accent="blue"
              to={isFinishDisabled ? undefined : finishButtonPath}
              disabled={isFinishDisabled}
            />
          }
        />
      }
    >
      <SettingsPageContainer>
        <SettingsRolePermissionsObjectLevelObjectFormObjectLevel
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
        />
        <SettingsRolePermissionsObjectLevelObjectFieldPermissionTable
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
        />
        <SettingsRolePermissionsObjectLevelRecordLevelSection
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
          hasOrganizationPlan={isRLSBillingEntitlementEnabled}
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
