import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconLock,
  IconUserPlus,
  IconUsers,
} from 'twenty-ui-deprecated/display';

import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { Section } from 'twenty-ui-deprecated/layout';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsWorkspaceMembersInviteTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersInviteTab';
import { SettingsWorkspaceMembersRolesTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersRolesTab';
import { SettingsWorkspaceMembersTeamTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersTeamTab';
import coverDark from '~/pages/settings/members/assets/cover-dark.png';
import coverLight from '~/pages/settings/members/assets/cover-light.png';

const MEMBERS_TAB_LIST_ID = 'members-tab-list';

const MEMBERS_TAB_TEAM_ID = 'team';
const MEMBERS_TAB_INVITE_ID = 'invite';
const MEMBERS_TAB_ROLES_ID = 'roles';

const SETTINGS_MEMBERS_HERO_INSTANCE_ID_PREFIX = 'settings-members-hero';

export const SettingsWorkspaceMembers = () => {
  const { t } = useLingui();

  const hasRolesPermission = useHasPermissionFlag(PermissionFlagType.ROLES);

  const tabs = [
    { id: MEMBERS_TAB_TEAM_ID, title: t`Team`, Icon: IconUsers },
    { id: MEMBERS_TAB_INVITE_ID, title: t`Invite`, Icon: IconUserPlus },
    ...(hasRolesPermission
      ? [{ id: MEMBERS_TAB_ROLES_ID, title: t`Roles`, Icon: IconLock }]
      : []),
  ];

  const activeTabId = useSettingsActiveTabId(
    MEMBERS_TAB_LIST_ID,
    tabs.map((tab) => tab.id),
  );

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case MEMBERS_TAB_INVITE_ID:
        return <SettingsWorkspaceMembersInviteTab />;
      case MEMBERS_TAB_ROLES_ID:
        return hasRolesPermission ? (
          <SettingsWorkspaceMembersRolesTab />
        ) : (
          <SettingsWorkspaceMembersTeamTab />
        );
      default:
        return <SettingsWorkspaceMembersTeamTab />;
    }
  };

  return (
    <SettingsPageLayout
      title={t`Members`}
      secondaryBar={
        <SettingsTabBar tabs={tabs} componentInstanceId={MEMBERS_TAB_LIST_ID} />
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
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={coverLight}
            darkSrc={coverDark}
            instanceIdPrefix={SETTINGS_MEMBERS_HERO_INSTANCE_ID_PREFIX}
            tabs={[
              {
                id: 'team',
                title: t`Team`,
                Icon: IconUsers,
                vimeoId: '1185227242',
              },
              {
                id: 'invite',
                title: t`Invite`,
                Icon: IconUserPlus,
                vimeoId: '1185227242',
              },
              ...(hasRolesPermission
                ? [
                    {
                      id: 'roles',
                      title: t`Roles`,
                      Icon: IconLock,
                      vimeoId: '1185227242',
                    },
                  ]
                : []),
            ]}
            playButtonAriaLabel={t`Watch members demo`}
          />
        </Section>
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
