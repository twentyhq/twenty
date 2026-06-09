import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconCopy } from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';
import { Card, CardContent, Section } from 'twenty-ui-deprecated/layout';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledPre = styled.pre`
  font-family: monospace;
  margin: 0;
  white-space: pre;
`;

const buildMcpConfig = (serverUrl: string) =>
  `{
  "mcpServers": {
    "twenty": {
      "url": "${serverUrl}/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}`;

export const SettingsMcpSetup = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const mcpConfig = buildMcpConfig(REACT_APP_SERVER_BASE_URL);

  return (
    <Section>
      <H2Title
        title={t`Connect your AI assistant`}
        description={t`Add Twenty as a Model Context Protocol (MCP) server. Paste this config into Claude Desktop, Cursor, Cline, Continue, Zed, or any other MCP-aware client.`}
      />
      <Card rounded>
        <CardContent divider>
          <StyledPre>{mcpConfig}</StyledPre>
        </CardContent>
        <CardContent>
          <Button
            title={t`Copy config`}
            Icon={IconCopy}
            size="small"
            variant="secondary"
            onClick={() =>
              copyToClipboard(mcpConfig, t`MCP config copied to clipboard`)
            }
          />
        </CardContent>
      </Card>
    </Section>
  );
};
