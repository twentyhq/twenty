import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { H2Title, IconCopy } from 'twenty-ui-deprecated/display';
import { LightIconButton } from 'twenty-ui-deprecated/input';
import { Card, CardContent, Section } from 'twenty-ui-deprecated/layout';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledMcpConfigContainer = styled.div`
  position: relative;
`;

const StyledCopyButtonContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

const StyledPre = styled.pre`
  color: ${themeCssVariables.font.color.secondary};
  font-family: monospace;
  line-height: 1.5;
  margin: 0;
  overflow-x: auto;
  white-space: pre;
`;

const StyledJsonKey = styled.span`
  color: ${themeCssVariables.color.blue};
`;

const StyledJsonString = styled.span`
  color: ${themeCssVariables.color.green};
`;

const StyledJsonPlaceholder = styled.span`
  color: ${themeCssVariables.color.orange};
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

const renderJsonString = (token: string, key: string) => {
  const apiKeyPlaceholder = '<YOUR_API_KEY>';

  if (!token.includes(apiKeyPlaceholder)) {
    return <StyledJsonString key={key}>{token}</StyledJsonString>;
  }

  const [beforePlaceholder, afterPlaceholder] = token.split(apiKeyPlaceholder);

  return (
    <span key={key}>
      <StyledJsonString>{beforePlaceholder}</StyledJsonString>
      <StyledJsonPlaceholder>{apiKeyPlaceholder}</StyledJsonPlaceholder>
      <StyledJsonString>{afterPlaceholder}</StyledJsonString>
    </span>
  );
};

const getHighlightedMcpConfig = (mcpConfig: string) => {
  const jsonStringTokenRegex = /("(?:[^"\\]|\\.)*")(\s*:)?/g;
  const tokens: ReactNode[] = [];
  let previousMatchEndIndex = 0;
  let tokenIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = jsonStringTokenRegex.exec(mcpConfig)) !== null) {
    const [fullMatch, quotedString, trailingColon] = match;
    const matchIndex = match.index;

    if (matchIndex > previousMatchEndIndex) {
      tokens.push(mcpConfig.slice(previousMatchEndIndex, matchIndex));
    }

    if (trailingColon) {
      tokens.push(
        <StyledJsonKey key={`json-key-${tokenIndex}`}>
          {quotedString}
        </StyledJsonKey>,
      );
      tokens.push(trailingColon);
    } else {
      tokens.push(renderJsonString(quotedString, `json-string-${tokenIndex}`));
    }

    previousMatchEndIndex = matchIndex + fullMatch.length;
    tokenIndex += 1;
  }

  if (previousMatchEndIndex < mcpConfig.length) {
    tokens.push(mcpConfig.slice(previousMatchEndIndex));
  }

  return tokens;
};

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
        <CardContent>
          <StyledMcpConfigContainer>
            <StyledPre>{getHighlightedMcpConfig(mcpConfig)}</StyledPre>
            <StyledCopyButtonContainer>
              <LightIconButton
                Icon={IconCopy}
                size="small"
                accent="tertiary"
                aria-label={t`Copy MCP config`}
                title={t`Copy MCP config`}
                onClick={() =>
                  copyToClipboard(mcpConfig, t`MCP config copied to clipboard`)
                }
              />
            </StyledCopyButtonContainer>
          </StyledMcpConfigContainer>
        </CardContent>
      </Card>
    </Section>
  );
};
