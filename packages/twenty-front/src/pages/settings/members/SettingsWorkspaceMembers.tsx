import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconSparkle2 } from 'twenty-ui/icon';

import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useAvailableSettingsTabs } from '@/settings/hooks/useAvailableSettingsTabs';
import { SETTINGS_WORKSPACE_MEMBERS_TABS } from '@/settings/members/constants/SettingsWorkspaceMembersTabs';
import coverDark from '~/pages/settings/members/assets/cover-dark.png';
import coverLight from '~/pages/settings/members/assets/cover-light.png';
import { SettingsWorkspaceMembersInviteTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersInviteTab';
import { SettingsWorkspaceMembersRolesTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersRolesTab';
import { SettingsWorkspaceMembersTeamTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersTeamTab';

const SETTINGS_MEMBERS_HERO_INSTANCE_ID_PREFIX = 'settings-members-hero';

export const SettingsWorkspaceMembers = () => {
  const { t } = useLingui();

  const tabs = useAvailableSettingsTabs(SETTINGS_WORKSPACE_MEMBERS_TABS.TABS);

  const activeTabId = useSettingsActiveTabId(
    SETTINGS_WORKSPACE_MEMBERS_TABS.COMPONENT_INSTANCE_ID,
    tabs.map((tab) => tab.id),
  );

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case SETTINGS_WORKSPACE_MEMBERS_TABS.TABS_IDS.INVITE:
        return <SettingsWorkspaceMembersInviteTab />;
      case SETTINGS_WORKSPACE_MEMBERS_TABS.TABS_IDS.ROLES:
        return <SettingsWorkspaceMembersRolesTab />;
      default:
        return <SettingsWorkspaceMembersTeamTab />;
    }
  };

  return (
    <SettingsPageLayout
      title={t`Members`}
      secondaryBar={
        <SettingsTabBar
          aria-label={t`Workspace members`}
          tabs={tabs}
          componentInstanceId={
            SETTINGS_WORKSPACE_MEMBERS_TABS.COMPONENT_INSTANCE_ID
          }
        />
      }
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: <Trans>Members</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section.Root>
          <SettingsDiscoveryHeroCard
            lightSrc={coverLight}
            darkSrc={coverDark}
            instanceIdPrefix={SETTINGS_MEMBERS_HERO_INSTANCE_ID_PREFIX}
            tabs={[
              {
                id: 'members_walkthrough',
                title: t`Walkthrough`,
                Icon: IconSparkle2,
                vimeoId: '1217964364',
                hasSound: true,
              },
            ]}
            playButtonAriaLabel={t`Watch members demo`}
          />
        </Section.Root>
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
