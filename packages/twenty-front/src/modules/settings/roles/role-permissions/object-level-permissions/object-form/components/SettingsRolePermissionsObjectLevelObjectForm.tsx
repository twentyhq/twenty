import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getCoreAgentBreadcrumbLinks } from '@/object-core/agents/utils/getCoreAgentBreadcrumbLinks';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { mapRLSOperandToRecordFilterOperand } from '@/object-record/record-filter/utils/mapRLSOperandToRecordFilterOperand';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsRolePermissionsObjectLevelRestrictedFieldsSection } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/components/SettingsRolePermissionsObjectLevelRestrictedFieldsSection';
import { SettingsRolePermissionsObjectLevelObjectFormObjectLevel } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectFormObjectLevel';
import { SettingsRolePermissionsObjectLevelRecordLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useSearchParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isRecordFilterValueValid,
} from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
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
  const [searchParams] = useSearchParams();
  const fromAgentId = searchParams.get('fromAgent');
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

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

  const objectLabelPlural = objectMetadataItem.labelPlural;

  const agent = agentData?.findOneAgent;

  const breadcrumbLinks =
    fromAgentId && isDefined(agent)
      ? getCoreAgentBreadcrumbLinks([
          { children: agent.label, href: getCoreAgentLink(agent.id) },
          { children: objectLabelPlural },
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
            href: getSettingsPath(SettingsPath.RoleDetail, { roleId }),
          },
          { children: objectLabelPlural },
        ];

  const donePath =
    fromAgentId && isDefined(agent)
      ? getCoreAgentLink(agent.id)
      : getSettingsPath(SettingsPath.RoleDetail, { roleId });

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

  return (
    <SettingsPageLayout
      title={objectLabelPlural}
      icon={<ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />}
      tag={
        <Tag color="gray">
          {getIsMetadataItemCustom(objectMetadataItem)
            ? t`Custom`
            : t`Standard`}
        </Tag>
      }
      links={breadcrumbLinks}
      actionButton={
        <NavigationButton
          size="sm"
          to={donePath}
          disabled={hasInvalidPredicate}
          variant="solid"
          color="accent"
        >{t`Done`}</NavigationButton>
      }
    >
      <SettingsPageContainer>
        <SettingsRolePermissionsObjectLevelObjectFormObjectLevel
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
        />
        <SettingsRolePermissionsObjectLevelRecordLevelSection
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
          hasOrganizationPlan={isRLSBillingEntitlementEnabled}
        />
        <SettingsRolePermissionsObjectLevelRestrictedFieldsSection
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
