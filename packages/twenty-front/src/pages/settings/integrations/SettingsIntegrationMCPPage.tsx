import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { SettingsIntegrationMCP } from '@/settings/integrations/components/SettingsIntegrationMCP';
import { Trans, useLingui } from '@lingui/react/macro';

export const SettingsIntegrationMCPPage = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Integrations`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Integrations</Trans> },
        { children: <Trans>MCP</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={`MCP Server`}
            description={`Access your workspace data from your favorite MCP client like Claude Desktop, Windsurf or Cursor.`}
          />
          <SettingsIntegrationMCP />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
