import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsWorkspaceBlocklistSection } from '@/settings/workspace/components/SettingsWorkspaceBlocklistSection';
import { SettingsWorkspaceEmailGroupSection } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSection';
import { SettingsWorkspaceEmailSyncSection } from '@/settings/workspace/components/SettingsWorkspaceEmailSyncSection';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsInboxQueuesTable } from '@/settings/inbox/components/SettingsInboxQueuesTable';
import { useInboxSettings } from '@/settings/inbox/hooks/useInboxSettings';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import {
  IconInbox,
  IconMail,
  IconMailX,
  IconPhone,
  IconPlus,
} from 'twenty-ui/icon';
import coverDark from '~/pages/settings/communications/assets/cover-dark.png';
import coverLight from '~/pages/settings/communications/assets/cover-light.png';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const COMMUNICATIONS_TABS_INSTANCE_ID = 'settings-communications-tabs';

const COMMUNICATIONS_TAB_ID = {
  emails: 'emails',
  inbox: 'inbox',
} as const;

const StyledCardsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

// Shared inboxes live here rather than in a settings page of their own: an
// inbox a team watches is a channel the workspace communicates through, and
// where its work goes is the same conversation.
export const SettingsWorkspaceCommunications = () => {
  const { theme } = useContext(ThemeContext);

  const { t } = useLingui();

  const navigateSettings = useNavigateSettings();

  const isMessageCampaignFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
  );
  const isInboxFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_INBOX_ENABLED,
  );

  const { inboxQueues } = useInboxSettings();

  const tabs = [
    { id: COMMUNICATIONS_TAB_ID.emails, title: t`Emails`, Icon: IconMail },
    ...(isInboxFeatureEnabled
      ? [
          {
            id: COMMUNICATIONS_TAB_ID.inbox,
            title: t`Inbox`,
            Icon: IconInbox,
          },
        ]
      : []),
    {
      id: 'calls',
      title: t`Calls`,
      Icon: IconPhone,
      disabled: true,
      pill: t`Soon`,
    },
  ];

  // Only tabs that have content can be active, or a link to #calls lands on an
  // empty page instead of falling back to the first real tab.
  const activeTabId = useSettingsActiveTabId(
    COMMUNICATIONS_TABS_INSTANCE_ID,
    tabs.filter(({ disabled }) => disabled !== true).map(({ id }) => id),
  );

  return (
    <SettingsPageLayout
      title={t`Communication`}
      secondaryBar={
        <SettingsTabBar
          tabs={tabs}
          componentInstanceId={COMMUNICATIONS_TABS_INSTANCE_ID}
        />
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Communication` },
      ]}
    >
      <SettingsPageContainer>
        {activeTabId === COMMUNICATIONS_TAB_ID.emails && (
          <>
            <Section.Root>
              <SettingsDiscoveryHeroCard
                lightSrc={coverLight}
                darkSrc={coverDark}
                instanceIdPrefix="settings-communications-hero"
                tabs={[]}
              />
            </Section.Root>
            <SettingsWorkspaceEmailGroupSection />
            {isMessageCampaignFeatureEnabled && (
              <Section.Root>
                <Section.Header
                  title={t`Unsubscribe`}
                  description={t`Manage unsubscribers, opt-out topics, and the page recipients see`}
                />
                <StyledCardsColumn>
                  <SettingsCard
                    Icon={
                      <IconMailX
                        size={theme.icon.size.lg}
                        stroke={theme.icon.stroke.md}
                      />
                    }
                    title={t`Manage unsubscribe`}
                    onClick={() => navigateSettings(SettingsPath.Unsubscribe)}
                  />
                </StyledCardsColumn>
              </Section.Root>
            )}
          </>
        )}
        {activeTabId === COMMUNICATIONS_TAB_ID.inbox && (
          <>
            <Section.Root>
              <SettingsRolesQueryEffect />
              <Section.Header
                title={t`Shared inboxes`}
                description={t`An inbox a team watches together. Work sent here is nobody's until someone takes it.`}
              />
              <SettingsInboxQueuesTable inboxQueues={inboxQueues} />
              <StyledButtonRow>
                <NavigationButton
                  startIcon={<IconPlus />}
                  color="accent"
                  size="sm"
                  variant="solid"
                  to={getSettingsPath(SettingsPath.InboxQueueNew)}
                >
                  {t`New shared inbox`}
                </NavigationButton>
              </StyledButtonRow>
            </Section.Root>
          </>
        )}
        <SettingsWorkspaceEmailSyncSection />
        <SettingsWorkspaceBlocklistSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
