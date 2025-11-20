import { SettingsPath } from 'twenty-shared/types';

import { getSettingsPath } from 'twenty-shared/utils';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRoleDefaultRole } from '@/settings/roles/components/SettingsRolesDefaultRole';

import { SettingsRolesList } from '@/settings/roles/components/SettingsRolesList';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { H3Title } from 'twenty-ui/display';

export const SettingsRolesContainer = () => {
  const { t } = useLingui();

  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);
  const settingsRolesIsLoading = useRecoilValue(settingsRolesIsLoadingState);

  if (settingsRolesIsLoading && !settingsAllRoles) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={<H3Title title={t`Roles`} />}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Roles</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <SettingsRolesList />
        <SettingsRoleDefaultRole roles={settingsAllRoles} />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
