import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { PlaygroundSetupForm } from '@/settings/playground/components/PlaygroundSetupForm';
import { SettingsMcpSetup } from '@/settings/playground/components/SettingsMcpSetup';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import PlaygroundCoverDark from '@/settings/playground/assets/cover-dark.png';
import PlaygroundCoverLight from '@/settings/playground/assets/cover-light.png';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconBrandGraphql, IconCode, IconPlus, IconRobot, IconWebhook } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
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
      id: SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.API,
      title: t`API`,
      Icon: IconCode,
    },
    {
      id: SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.MCP,
      title: t`MCP`,
      Icon: IconRobot,
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
    ) as TabKey) ?? SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.API;

  return (
    <SettingsPageLayout
      title={t`APIs & Webhooks`}
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
        { children: t`APIs & Webhooks` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={PlaygroundCoverLight}
            darkSrc={PlaygroundCoverDark}
            instanceIdPrefix={SETTINGS_API_HERO_INSTANCE_ID_PREFIX}
            tabs={[
              {
                id: 'rest',
                title: t`REST`,
                Icon: IconCode,
                vimeoId: '928786722',
              },
              {
                id: 'graphql',
                title: t`GraphQL`,
                Icon: IconBrandGraphql,
                vimeoId: '928786722',
              },
            ]}
            playButtonAriaLabel={t`Watch API demo`}
          />
        </Section>

        {activeTab === SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.API && (
          <StyledTabContent>
            <Section>
              <H2Title
                title={t`Documentation`}
                description={t`Try our REST or GraphQL API playgrounds`}
              />
              <PlaygroundSetupForm />
            </Section>

            <Section>
              <H2Title
                title={t`API Keys`}
                description={t`Active API keys created by you or your team.`}
              />
              <StyledTableContainer isMobile={isMobile}>
                <SettingsApiKeysTable />
                <StyledButtonContainer>
                  <Button
                    Icon={IconPlus}
                    title={t`Create API key`}
                    size="small"
                    variant="secondary"
                    to={getSettingsPath(SettingsPath.NewApiKey)}
                  />
                </StyledButtonContainer>
              </StyledTableContainer>
            </Section>
          </StyledTabContent>
        )}

        {activeTab === SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.MCP && (
          <StyledTabContent>
            <SettingsMcpSetup />
          </StyledTabContent>
        )}

        {activeTab === SETTINGS_API_WEBHOOKS_TABS.TABS_IDS.WEBHOOKS && (
          <StyledTabContent>
            <Section>
              <H2Title
                title={t`Webhooks`}
                description={t`Establish Webhook endpoints for notifications on asynchronous events.`}
              />
              <StyledTableContainer isMobile={isMobile}>
                <SettingsWebhooksTable />
                <StyledButtonContainer>
                  <Button
                    Icon={IconPlus}
                    title={t`Create webhook`}
                    size="small"
                    variant="secondary"
                    to={getSettingsPath(SettingsPath.NewWebhook)}
                  />
                </StyledButtonContainer>
              </StyledTableContainer>
            </Section>
          </StyledTabContent>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
