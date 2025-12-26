import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissionsObjectLevelObjectPicker } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelObjectPicker';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useFindOneAgentQuery } from '~/generated-metadata/graphql';

export const SettingsRoleAddObjectLevel = () => {
  const { roleId } = useParams();
  const [searchParams] = useSearchParams();
  const fromAgentId = searchParams.get('fromAgent');

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId ?? ''),
  );

  const { data: agentData } = useFindOneAgentQuery({
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
            children: t`Add object permission`,
          },
        ]
      : [
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

  return (
    <>
      <SettingsRolesQueryEffect />
      <SubMenuTopBarContainer
        title={t`1. Select an object`}
        links={breadcrumbLinks}
      >
        <SettingsPageContainer>
          <SettingsRolePermissionsObjectLevelObjectPicker roleId={roleId} />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};
