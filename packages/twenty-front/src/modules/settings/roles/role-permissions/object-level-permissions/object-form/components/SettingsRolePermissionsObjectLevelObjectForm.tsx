import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { isFilterOperandExpectingValue } from '@/object-record/object-filter-dropdown/utils/isFilterOperandExpectingValue';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolePermissionsObjectLevelObjectFieldPermissionTable } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelObjectFieldPermissionTable';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevel } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevel';
import { SettingsRolePermissionsObjectLevelRecordLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { t } from '@lingui/core/macro';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { SettingsPath, type ViewFilterOperand } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import {
  type BillingEntitlement,
  BillingEntitlementKey,
  FeatureFlagKey,
  useFindOneAgentQuery,
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
  const fromAgentId = searchParams.get('fromAgent');

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const { data: agentData } = useFindOneAgentQuery({
    variables: { id: fromAgentId || '' },
    skip: !fromAgentId,
  });

  const objectMetadata = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const featureFlagsMap = useFeatureFlagsMap();

  const workspaceBillingEntitlements = currentWorkspace?.billingEntitlements;

  const isRLSBillingEntitlementEnabled =
    workspaceBillingEntitlements?.some(
      (entitlement: BillingEntitlement) =>
        entitlement.key === BillingEntitlementKey.RLS &&
        entitlement.value === true,
    ) ?? false;

  const isRowLevelPermissionPredicatesEnabled =
    featureFlagsMap[FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED];

  const objectMetadataItem = objectMetadata.objectMetadataItem;

  const objectLabelSingular = objectMetadataItem.labelSingular;
  const objectLabelPlural = objectMetadataItem.labelPlural;

  const agent = agentData?.findOneAgent;

  const breadcrumbLinks =
    fromAgentId && isDefined(agent)
      ? [
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`AI`,
            href: getSettingsPath(SettingsPath.AI),
          },
          {
            children: agent.label,
            href: getSettingsPath(SettingsPath.AIAgentDetail, {
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
            href: getSettingsPath(SettingsPath.Workspace),
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
      ? getSettingsPath(SettingsPath.AIAgentDetail, { agentId: agent.id })
      : getSettingsPath(SettingsPath.RoleDetail, { roleId });

  const objectPredicates =
    settingsDraftRole.rowLevelPermissionPredicates?.filter(
      (predicate) => predicate.objectMetadataId === objectMetadataItem.id,
    ) ?? [];

  const hasInvalidPredicate = objectPredicates.some((predicate) => {
    if (isDefined(predicate.workspaceMemberFieldMetadataId)) {
      return false;
    }

    const operand = predicate.operand as unknown as ViewFilterOperand;

    if (!isFilterOperandExpectingValue(operand)) {
      return false;
    }

    return (
      !isDefined(predicate.value) ||
      predicate.value === '' ||
      predicate.value === '[]'
    );
  });

  const isFinishDisabled = hasInvalidPredicate;

  return (
    <SubMenuTopBarContainer
      title={t`2. Set ${objectLabelPlural} permissions`}
      links={breadcrumbLinks}
      actionButton={
        <Button
          title={t`Finish`}
          variant="secondary"
          size="small"
          accent="blue"
          to={isFinishDisabled ? undefined : finishButtonPath}
          disabled={isFinishDisabled}
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
        {isRowLevelPermissionPredicatesEnabled && (
          <SettingsRolePermissionsObjectLevelRecordLevelSection
            objectMetadataItem={objectMetadataItem}
            roleId={roleId}
            hasOrganizationPlan={isRLSBillingEntitlementEnabled}
          />
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
