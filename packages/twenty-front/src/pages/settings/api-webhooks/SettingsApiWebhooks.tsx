import { NavigationButton } from '@/ui/input/components/NavigationButton';

import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import PlaygroundCoverDark from '@/settings/mcp-and-apis/assets/cover-dark.png';
import PlaygroundCoverLight from '@/settings/mcp-and-apis/assets/cover-light.png';
import McpCoverDark from '@/settings/mcp-and-apis/assets/mcp-cover-dark.png';
import McpCoverLight from '@/settings/mcp-and-apis/assets/mcp-cover-light.png';
import { PlaygroundSetupForm } from '@/settings/mcp-and-apis/components/PlaygroundSetupForm';
import { SettingsMcpSetup } from '@/settings/mcp-and-apis/components/SettingsMcpSetup';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import {
  IconApi,
  IconPlus,
  IconSparkle2,
  IconSparkles,
  IconWebhook,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { SETTINGS_API_WEBHOOKS_TABS } from '~/pages/settings/api-webhooks/constants/SettingsApiWebhooksTabs';

type TabKey =
  (typeof SETTINGS_API_WEBHOOKS_TABS.TABS_IDS)[keyof typeof SETTINGS_API_WEBHOOKS_TABS.TABS_IDS];

const SETTINGS_API_HERO_INSTANCE_ID_PREFIX = 'settings-api-hero';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${themeCssVariables.spacing[5]};
  }
`;

const StyledTabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[10]};
  padding-top: ${themeCssVariables.spacing[6]};
`;

const StyledTableContainer = styled.div<{ isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow: ${({ isMobile }) => (isMobile ? 'hidden' : 'visible')};
`;

export const SettingsApiWebhooks = () => {
  const isMobile = useIsMobile();
  const { t } = useLingui();

  const tabs = [
    {
      id: SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.MCP,
      title: t`MCP`,
      Icon: IconSparkles,
    },
    {
      id: SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.API,
      title: t`API`,
      Icon: IconApi,
    },
    {
      id: SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.WEBHOOKS,
      title: t`Webhooks`,
      Icon: IconWebhook,
    },
  ];

  const activeTab: TabKey =
    (useSettingsActiveTabId(
      SETTINGS_API_WEBHOOKS_TABS.COMPONENT_INSTANCE_ID,
      tabs.map((tab) => tab.id),
    ) as TabKey) ?? SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.MCP;

  const isMcpTab = activeTab === SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.MCP;

  return (
    <SettingsPageLayout
      title={t`MCP & APIs`}
      secondaryBar={
        <SettingsTabBar
          tabs={tabs}
          componentInstanceId={SETTINGS_API_WEBHOOKS_TABS.COMPONENT_INSTANCE_ID}
        />
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`MCP & APIs` },
      ]}
    >
      <SettingsPageContainer>
        <Section.Root>
          <SettingsDiscoveryHeroCard
            lightSrc={isMcpTab ? McpCoverLight : PlaygroundCoverLight}
            darkSrc={isMcpTab ? McpCoverDark : PlaygroundCoverDark}
            instanceIdPrefix={SETTINGS_API_HERO_INSTANCE_ID_PREFIX}
            tabs={[
              {
                id: 'api_webhook_walkthrough',
                title: t`Walkthrough`,
                Icon: IconSparkle2,
                vimeoId: '1217967646',
                hasSound: true,
              },
            ]}
            playButtonAriaLabel={t`Watch API demo`}
          />
        </Section.Root>

        {activeTab === SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.API && (
          <StyledTabContent>
            <Section.Root>
              <Section.Header
                title={t`Documentation`}
                description={t`Try our REST or GraphQL API playgrounds`}
              />
              <PlaygroundSetupForm />
            </Section.Root>

            <Section.Root>
              <Section.Header
                title={t`API Keys`}
                description={t`Active API keys created by you or your team.`}
              />
              <StyledTableContainer isMobile={isMobile}>
                <SettingsApiKeysTable />
                <StyledButtonContainer>
                  <NavigationButton
                    startIcon={<IconPlus />}
                    size="sm"
                    to={getSettingsPath(SettingsPath.NewApiKey)}
                    variant="outline"
                  >{t`Create API key`}</NavigationButton>
                </StyledButtonContainer>
              </StyledTableContainer>
            </Section.Root>
          </StyledTabContent>
        )}

        {activeTab === SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.MCP && (
          <StyledTabContent>
            <SettingsMcpSetup />
          </StyledTabContent>
        )}

        {activeTab === SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.WEBHOOKS && (
          <StyledTabContent>
            <Section.Root>
              <Section.Header
                title={t`Webhooks`}
                description={t`Establish Webhook endpoints for notifications on asynchronous events.`}
              />
              <StyledTableContainer isMobile={isMobile}>
                <SettingsWebhooksTable />
                <StyledButtonContainer>
                  <NavigationButton
                    startIcon={<IconPlus />}
                    size="sm"
                    to={getSettingsPath(SettingsPath.NewWebhook)}
                    variant="outline"
                  >{t`Create webhook`}</NavigationButton>
                </StyledButtonContainer>
              </StyledTableContainer>
            </Section.Root>
          </StyledTabContent>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
