import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconLock, IconUserPlus, IconUsers } from 'twenty-ui/display';

import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { Section } from 'twenty-ui/layout';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsWorkspaceMembersInviteTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersInviteTab';
import { SettingsWorkspaceMembersRolesTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersRolesTab';
import { SettingsWorkspaceMembersTeamTab } from '~/pages/settings/members/tabs/SettingsWorkspaceMembersTeamTab';
// TODO: replace with members-specific illustrations + recordings when designed.
import placeholderHeroDark from '~/pages/settings/layout/assets/customize-illustration-dark.png';
import placeholderHeroLight from '~/pages/settings/layout/assets/customize-illustration-light.png';

const MEMBERS_TAB_LIST_ID = 'members-tab-list';

const MEMBERS_TAB_TEAM_ID = 'team';
const MEMBERS_TAB_INVITE_ID = 'invite';
const MEMBERS_TAB_ROLES_ID = 'roles';

const SETTINGS_MEMBERS_HERO_MODAL_ID = 'settings-members-hero-modal';
const SETTINGS_MEMBERS_HERO_TABS_ID = 'settings-members-hero-tabs';

export const SettingsWorkspaceMembers = () => {
  const { t } = useLingui();

  const hasRolesPermission = useHasPermissionFlag(PermissionFlagType.ROLES);

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    MEMBERS_TAB_LIST_ID,
  );

  const tabs = [
    { id: MEMBERS_TAB_TEAM_ID, title: t`Team`, Icon: IconUsers },
    { id: MEMBERS_TAB_INVITE_ID, title: t`Invite`, Icon: IconUserPlus },
    ...(hasRolesPermission
      ? [{ id: MEMBERS_TAB_ROLES_ID, title: t`Roles`, Icon: IconLock }]
      : []),
  ];

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
    <SubMenuTopBarContainer
      title={t`Members`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Members</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={placeholderHeroLight}
            darkSrc={placeholderHeroDark}
            modalInstanceId={SETTINGS_MEMBERS_HERO_MODAL_ID}
            tabsInstanceId={SETTINGS_MEMBERS_HERO_TABS_ID}
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
        <TabList tabs={tabs} componentInstanceId={MEMBERS_TAB_LIST_ID} />
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
