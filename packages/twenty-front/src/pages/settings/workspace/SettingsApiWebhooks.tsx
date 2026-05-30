import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { SettingsMcpSetup } from '@/settings/playground/components/SettingsMcpSetup';
import { useOpenPlayground } from '@/settings/playground/hooks/useOpenPlayground';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
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
  IconKey,
  IconPlus,
  IconRobot,
  IconWebhook,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

type TabKey = 'playground' | 'mcp' | 'api-keys' | 'webhooks';

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

const StyledPlaygroundCardGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTableContainer = styled.div<{ isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow: ${({ isMobile }) => (isMobile ? 'hidden' : 'visible')};
`;

const TAB_KEYS = ['playground', 'mcp', 'api-keys', 'webhooks'] as const;

const isTabKey = (value: string): value is TabKey =>
  (TAB_KEYS as readonly string[]).includes(value);

export const SettingsApiWebhooks = () => {
  const isMobile = useIsMobile();
  const { t } = useLingui();
  const openPlayground = useOpenPlayground();

  // TabList writes to activeTabIdComponentState (keyed by componentInstanceId)
  // on click, and its internal TabListFromUrlOptionalEffect syncs URL hash →
  // atom so deep links land on the right tab. We only read here.
  const activeTabIdFromState = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_API_WEBHOOKS_TABS_INSTANCE_ID,
  );
  const activeTab: TabKey = isTabKey(activeTabIdFromState ?? '')
    ? (activeTabIdFromState as TabKey)
    : 'playground';

  const tabs = [
    {
      id: 'playground' satisfies TabKey,
      title: t`Playground`,
      Icon: IconCode,
    },
    {
      id: 'mcp' satisfies TabKey,
      title: t`MCP`,
      Icon: IconRobot,
    },
    {
      id: 'api-keys' satisfies TabKey,
      title: t`API Keys`,
      Icon: IconKey,
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

        {activeTab === 'playground' && (
          <StyledTabContent>
            <Section>
              <H2Title
                title={t`Core API`}
                description={t`Read, create, and update records in your workspace — companies, people, opportunities, and your custom objects. This is the API you use to build integrations against your data.`}
              />
              <StyledPlaygroundCardGroup>
                <SettingsCard
                  title={t`REST playground`}
                  Icon={<IconCode size={16} />}
                  onClick={() =>
                    openPlayground('rest', PlaygroundSchemas.CORE)
                  }
                />
                <SettingsCard
                  title={t`GraphQL playground`}
                  Icon={<IconBrandGraphql size={16} />}
                  onClick={() =>
                    openPlayground('graphql', PlaygroundSchemas.CORE)
                  }
                />
              </StyledPlaygroundCardGroup>
            </Section>

            <Section>
              <H2Title
                title={t`Metadata API`}
                description={t`Read and modify the workspace schema itself — objects, fields, relations, and indexes. Use this to provision custom data models programmatically.`}
              />
              <StyledPlaygroundCardGroup>
                <SettingsCard
                  title={t`REST playground`}
                  Icon={<IconCode size={16} />}
                  onClick={() =>
                    openPlayground('rest', PlaygroundSchemas.METADATA)
                  }
                />
                <SettingsCard
                  title={t`GraphQL playground`}
                  Icon={<IconBrandGraphql size={16} />}
                  onClick={() =>
                    openPlayground('graphql', PlaygroundSchemas.METADATA)
                  }
                />
              </StyledPlaygroundCardGroup>
            </Section>
          </StyledTabContent>
        )}

        {activeTab === 'mcp' && (
          <StyledTabContent>
            <SettingsMcpSetup />
          </StyledTabContent>
        )}

        {activeTab === 'api-keys' && (
          <StyledTabContent>
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
