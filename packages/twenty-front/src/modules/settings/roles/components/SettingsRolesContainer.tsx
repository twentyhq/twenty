import { SettingsPath } from 'twenty-shared/types';

import { getSettingsPath } from 'twenty-shared/utils';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRoleDefaultRole } from '@/settings/roles/components/SettingsRolesDefaultRole';

import { SettingsRolesList } from '@/settings/roles/components/SettingsRolesList';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Trans, useLingui } from '@lingui/react/macro';
import { H3Title } from 'twenty-ui/display';

export const SettingsRolesContainer = () => {
  const { t } = useLingui();

  const settingsAllRoles = useSettingsAllRoles();
  const settingsRolesIsLoading = useAtomStateValue(settingsRolesIsLoadingState);

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
