import { SettingsPath } from 'twenty-shared/types';

import { getSettingsPath } from 'twenty-shared/utils';

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
import { H3Title, IconUser, IconRobot, IconKey } from 'twenty-ui/display';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';
import { TabList } from '@/ui/layout/tab-list/components/TabList';

export const SettingsRolesContainer = () => {
  const { t } = useLingui();

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    ROLES_LIST_TABS.COMPONENT_INSTANCE_ID,
  );
  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);
  const settingsRolesIsLoading = useRecoilValue(settingsRolesIsLoadingState);
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const tabs = [
    {
      id: ROLES_LIST_TABS.TABS_IDS.USER_ROLES,
      title: t`User Roles`,
      Icon: IconUser,
    },
    ...(isAiEnabled
      ? [
          {
            id: ROLES_LIST_TABS.TABS_IDS.AGENT_ROLES,
            title: t`Agent Roles`,
            Icon: IconRobot,
          },
        ]
      : []),
    {
      id: ROLES_LIST_TABS.TABS_IDS.API_KEY_ROLES,
      title: t`API Key Roles`,
      Icon: IconKey,
    },
  ];

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
        <TabList
          tabs={tabs}
          className="tab-list"
          componentInstanceId={ROLES_LIST_TABS.COMPONENT_INSTANCE_ID}
        />
        <SettingsRolesList />
        {activeTabId === ROLES_LIST_TABS.TABS_IDS.USER_ROLES && (
          <SettingsRoleDefaultRole roles={settingsAllRoles} />
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
