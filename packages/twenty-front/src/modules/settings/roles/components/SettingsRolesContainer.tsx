import { SettingsPath } from '@/types/SettingsPath';

import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRoleDefaultRole } from '@/settings/roles/components/SettingsRolesDefaultRole';

import { SettingsRolesList } from '@/settings/roles/components/SettingsRolesList';
import { ROLES_LIST_TABS } from '@/settings/roles/constants/RolesListTabs';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { H3Title } from 'twenty-ui/display';

export const SettingsRolesContainer = () => {
  const { t } = useLingui();

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    ROLES_LIST_TABS.COMPONENT_INSTANCE_ID,
  );
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
        {activeTabId === ROLES_LIST_TABS.TABS_IDS.USER_ROLES && (
          <SettingsRoleDefaultRole roles={settingsAllRoles} />
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
