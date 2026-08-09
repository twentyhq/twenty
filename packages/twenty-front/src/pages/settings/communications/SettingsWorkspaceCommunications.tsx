import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsWorkspaceEmailGroupSection } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSection';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsInboxQueuesTable } from '@/settings/inbox/components/SettingsInboxQueuesTable';
import { SettingsInboxRoutingTable } from '@/settings/inbox/components/SettingsInboxRoutingTable';
import { useInboxSettings } from '@/settings/inbox/hooks/useInboxSettings';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconBrandWhatsapp,
  IconInbox,
  IconMail,
  IconMailX,
  IconPhone,
  IconPlus,
  IconArrowsSplit2,
} from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import coverDark from '~/pages/settings/communications/assets/cover-dark.png';
import coverLight from '~/pages/settings/communications/assets/cover-light.png';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const COMMUNICATIONS_TABS_INSTANCE_ID = 'settings-communications-tabs';

const COMMUNICATIONS_TAB_ID = {
  emails: 'emails',
  sharedInboxes: 'shared-inboxes',
  routing: 'routing',
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

  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );
  const isInboxFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_INBOX_ENABLED,
  );

  const { inboxQueues, inboxItemTypes } = useInboxSettings();

  const tabs = [
    ...(isEmailGroupFeatureEnabled
      ? [{ id: COMMUNICATIONS_TAB_ID.emails, title: t`Emails`, Icon: IconMail }]
      : []),
    ...(isInboxFeatureEnabled
      ? [
          {
            id: COMMUNICATIONS_TAB_ID.sharedInboxes,
            title: t`Shared inboxes`,
            Icon: IconInbox,
          },
          {
            id: COMMUNICATIONS_TAB_ID.routing,
            title: t`Routing`,
            Icon: IconArrowsSplit2,
          },
        ]
      : []),
    {
      id: 'whatsapp',
      title: t`Whatsapp`,
      Icon: IconBrandWhatsapp,
      disabled: true,
      pill: t`Soon`,
    },
    {
      id: 'calls',
      title: t`Calls`,
      Icon: IconPhone,
      disabled: true,
      pill: t`Soon`,
    },
  ];

  // Only tabs that have content can be active, or a link to #whatsapp lands on
  // an empty page instead of falling back to the first real tab.
  const activeTabId = useSettingsActiveTabId(
    COMMUNICATIONS_TABS_INSTANCE_ID,
    tabs.filter(({ disabled }) => disabled !== true).map(({ id }) => id),
  );

  if (!isEmailGroupFeatureEnabled && !isInboxFeatureEnabled) {
    return null;
  }

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
            <Section>
              <SettingsDiscoveryHeroCard
                lightSrc={coverLight}
                darkSrc={coverDark}
                instanceIdPrefix="settings-communications-hero"
                tabs={[]}
              />
            </Section>
            <SettingsWorkspaceEmailGroupSection />
            <Section>
              <H2Title
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
            </Section>
          </>
        )}
        {activeTabId === COMMUNICATIONS_TAB_ID.sharedInboxes && (
          <Section>
            <H2Title
              title={t`Shared inboxes`}
              description={t`An inbox a team watches together. Work sent here is nobody's until someone takes it.`}
            />
            <SettingsInboxQueuesTable inboxQueues={inboxQueues} />
            <StyledButtonRow>
              <Button
                Icon={IconPlus}
                title={t`New shared inbox`}
                accent="blue"
                size="small"
                to={getSettingsPath(SettingsPath.InboxQueueNew)}
              />
            </StyledButtonRow>
          </Section>
        )}
        {activeTabId === COMMUNICATIONS_TAB_ID.routing && (
          <Section>
            <H2Title
              title={t`Routing`}
              description={t`Where each kind of work goes when nothing named a recipient. Rules with conditions belong in a workflow.`}
            />
            <SettingsInboxRoutingTable
              inboxItemTypes={inboxItemTypes}
              inboxQueues={inboxQueues}
            />
          </Section>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
