import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissionsObjectLevelObjectPicker } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelObjectPicker';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWizardStepBar } from '@/settings/components/layout/SettingsWizardStepBar';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { useQuery } from '@apollo/client/react';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';

export const SettingsRoleAddObjectLevel = () => {
  const { roleId } = useParams();
  const [searchParams] = useSearchParams();
  const fromAgentId = searchParams.get('fromAgent');

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId ?? '',
  );

  const { data: agentData } = useQuery(FindOneAgentDocument, {
    variables: { id: fromAgentId || '' },
    skip: !fromAgentId,
  });

  const agent = agentData?.findOneAgent;

  if (!roleId) {
    return <Navigate to={getSettingsPath(SettingsPath.Roles)} />;
  }

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
            children: t`Add object permission`,
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
          { children: t`Roles`, href: getSettingsPath(SettingsPath.Roles) },
          {
            children: settingsDraftRole.label ?? '',
            href: getSettingsPath(SettingsPath.RoleDetail, { roleId }),
          },
          {
            children: t`Add object permission`,
            href: getSettingsPath(SettingsPath.RoleAddObjectLevel, { roleId }),
          },
        ];

  const headerTitle =
    fromAgentId && isDefined(agent)
      ? agent.label
      : (settingsDraftRole.label ?? '');

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsPageLayout
        title={headerTitle}
        titleColor={themeCssVariables.font.color.tertiary}
        links={breadcrumbLinks}
        secondaryBar={<SettingsWizardStepBar label={t`1. Select an object`} />}
      >
        <SettingsPageContainer>
          <SettingsRolePermissionsObjectLevelObjectPicker roleId={roleId} />
        </SettingsPageContainer>
      </SettingsPageLayout>
    </>
  );
};
