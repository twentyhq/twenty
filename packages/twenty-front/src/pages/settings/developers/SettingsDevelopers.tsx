import { NavigationButton } from '@/ui/input/components/NavigationButton';

import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import PlaygroundCoverDark from '@/settings/developers/assets/cover-dark.png';
import PlaygroundCoverLight from '@/settings/developers/assets/cover-light.png';
import { PlaygroundSetupForm } from '@/settings/developers/components/PlaygroundSetupForm';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import {
  IconApi,
  IconApps,
  IconPlus,
  IconSparkle2,
  IconWebhook,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';
import AppsCoverDark from '~/pages/settings/applications/assets/cover-dark.png';
import AppsCoverLight from '~/pages/settings/applications/assets/cover-light.png';
import { SettingsDevelopersClaimErrorTabEffect } from '~/pages/settings/developers/components/SettingsDevelopersClaimErrorTabEffect';
import { SettingsDevelopersAppsTab } from '~/pages/settings/developers/tabs/SettingsDevelopersAppsTab';

type TabKey =
  (typeof SETTINGS_DEVELOPERS_TABS.TABS_IDS)[keyof typeof SETTINGS_DEVELOPERS_TABS.TABS_IDS];

const SETTINGS_DEVELOPERS_HERO_INSTANCE_ID_PREFIX = 'settings-developers-hero';

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

export const SettingsDevelopers = () => {
  const isMobile = useIsMobile();
  const { t } = useLingui();

  const tabs = [
    {
      id: SETTINGS_DEVELOPERS_TABS.TABS_IDS.API,
      title: t`API`,
      Icon: IconApi,
    },
    {
      id: SETTINGS_DEVELOPERS_TABS.TABS_IDS.WEBHOOKS,
      title: t`Webhooks`,
      Icon: IconWebhook,
    },
    {
      id: SETTINGS_DEVELOPERS_TABS.TABS_IDS.APPS,
      title: t`Apps`,
      Icon: IconApps,
    },
  ];

  const activeTab: TabKey =
    (useSettingsActiveTabId(
      SETTINGS_DEVELOPERS_TABS.COMPONENT_INSTANCE_ID,
      tabs.map((tab) => tab.id),
    ) as TabKey) ?? SETTINGS_DEVELOPERS_TABS.TABS_IDS.API;

  const isAppsTab = activeTab === SETTINGS_DEVELOPERS_TABS.TABS_IDS.APPS;

  return (
    <SettingsPageLayout
      title={t`Developers`}
      secondaryBar={
        <SettingsTabBar
          aria-label={t`Developers`}
          tabs={tabs}
          componentInstanceId={SETTINGS_DEVELOPERS_TABS.COMPONENT_INSTANCE_ID}
        />
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Developers` },
      ]}
    >
      <SettingsDevelopersClaimErrorTabEffect
        tabListId={SETTINGS_DEVELOPERS_TABS.COMPONENT_INSTANCE_ID}
        appsTabId={SETTINGS_DEVELOPERS_TABS.TABS_IDS.APPS}
      />
      <SettingsPageContainer>
        <Section.Root>
          <SettingsDiscoveryHeroCard
            lightSrc={isAppsTab ? AppsCoverLight : PlaygroundCoverLight}
            darkSrc={isAppsTab ? AppsCoverDark : PlaygroundCoverDark}
            instanceIdPrefix={SETTINGS_DEVELOPERS_HERO_INSTANCE_ID_PREFIX}
            tabs={
              isAppsTab
                ? []
                : [
                    {
                      id: 'api_webhook_walkthrough',
                      title: t`Walkthrough`,
                      Icon: IconSparkle2,
                      vimeoId: '1217967646',
                      hasSound: true,
                    },
                  ]
            }
            playButtonAriaLabel={t`Watch API demo`}
          />
        </Section.Root>

        {activeTab === SETTINGS_DEVELOPERS_TABS.TABS_IDS.API && (
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

        {activeTab === SETTINGS_DEVELOPERS_TABS.TABS_IDS.WEBHOOKS && (
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

        {isAppsTab && <SettingsDevelopersAppsTab />}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
