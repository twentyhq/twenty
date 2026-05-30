import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { PlaygroundSetupForm } from '@/settings/playground/components/PlaygroundSetupForm';
import { SettingsMcpSetup } from '@/settings/playground/components/SettingsMcpSetup';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import PlaygroundCoverDark from '@/settings/playground/assets/cover-dark.png';
import PlaygroundCoverLight from '@/settings/playground/assets/cover-light.png';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconBrandGraphql,
  IconCode,
  IconPlus,
  IconRobot,
  IconWebhook,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

type TabKey = 'api' | 'mcp' | 'webhooks';

const SETTINGS_API_WEBHOOKS_TABS_INSTANCE_ID = 'settings-api-webhooks-tabs';
const SETTINGS_API_HERO_MODAL_ID = 'settings-api-hero-modal';
const SETTINGS_API_HERO_TABS_ID = 'settings-api-hero-tabs';

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

const TAB_KEYS = ['api', 'mcp', 'webhooks'] as const;

const isTabKey = (value: string): value is TabKey =>
  (TAB_KEYS as readonly string[]).includes(value);

export const SettingsApiWebhooks = () => {
  const isMobile = useIsMobile();
  const { t } = useLingui();

  // TabList writes to activeTabIdComponentState (keyed by componentInstanceId)
  // on click, and its internal TabListFromUrlOptionalEffect syncs URL hash →
  // atom so deep links land on the right tab. We only read here.
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_API_WEBHOOKS_TABS_INSTANCE_ID,
  );
  const activeTab: TabKey = isTabKey(activeTabId ?? '')
    ? (activeTabId as TabKey)
    : 'api';

  const tabs = [
    {
      id: 'api' satisfies TabKey,
      title: t`API`,
      Icon: IconCode,
    },
    {
      id: 'mcp' satisfies TabKey,
      title: t`MCP`,
      Icon: IconRobot,
    },
    {
      id: 'webhooks' satisfies TabKey,
      title: t`Webhooks`,
      Icon: IconWebhook,
    },
  ];

  return (
    <SubMenuTopBarContainer
      title={t`APIs & Webhooks`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`APIs & Webhooks` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={PlaygroundCoverLight.toString()}
            darkSrc={PlaygroundCoverDark.toString()}
            modalInstanceId={SETTINGS_API_HERO_MODAL_ID}
            tabsInstanceId={SETTINGS_API_HERO_TABS_ID}
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

        <TabList
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={SETTINGS_API_WEBHOOKS_TABS_INSTANCE_ID}
        />

        {activeTab === 'api' && (
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

        {activeTab === 'mcp' && (
          <StyledTabContent>
            <SettingsMcpSetup />
          </StyledTabContent>
        )}

        {activeTab === 'webhooks' && (
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
    </SubMenuTopBarContainer>
  );
};
