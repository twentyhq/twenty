import { useContext, useState } from 'react';

import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconCopy } from 'twenty-ui/display';
import { CodeEditor, IconButton } from 'twenty-ui/input';
import { Card, CardContent, Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledCoverImage = styled.div`
  background-position: center;
  background-size: cover;
  height: 160px;
  overflow: hidden;
`;

const StyledConfigButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  position: absolute;
  right: ${themeCssVariables.spacing[3]};
  top: ${themeCssVariables.spacing[3]};
  z-index: 1;
`;

const StyledCoverCardContent = styled(CardContent)`
  padding: 0;
`;

const StyledCopyButton = styled(IconButton)`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledEditorContainer = styled.div`
  .monaco-editor,
  .monaco-editor .overflow-guard {
    background-color: transparent !important;
    border: none !important;
  }

  .monaco-editor .line-hover {
    background-color: transparent !important;
  }
`;

type McpAuthMethod = 'oauth' | 'api-key';

export const SettingsAiMCP = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const [authMethod, setAuthMethod] = useState<McpAuthMethod>('oauth');
  const { colorScheme } = useContext(ThemeContext);
  const coverImage =
    colorScheme === 'light'
      ? '/images/ai/ai-mcp-cover-light.svg'
      : '/images/ai/ai-mcp-cover-dark.svg';

  const oauthConfig = JSON.stringify(
    {
      mcpServers: {
        twenty: {
          type: 'streamable-http',
          url: `${REACT_APP_SERVER_BASE_URL}/mcp`,
        },
      },
    },
    null,
    2,
  );

  const apiKeyConfig = JSON.stringify(
    {
      mcpServers: {
        twenty: {
          type: 'streamable-http',
          url: `${REACT_APP_SERVER_BASE_URL}/mcp`,
          headers: {
            Authorization: 'Bearer [API_KEY]',
          },
        },
      },
    },
    null,
    2,
  );

  const isOAuth = authMethod === 'oauth';
  const activeConfig = isOAuth ? oauthConfig : apiKeyConfig;
  const editorHeight = isOAuth ? 170 : 230;

  const codeEditorOptions = {
    readOnly: true,
    domReadOnly: true,
    renderLineHighlight: 'none' as const,
    renderLineHighlightOnlyWhenFocus: false,
    lineNumbers: 'off' as const,
    folding: false,
    selectionHighlight: false,
    occurrencesHighlight: 'off' as const,
    scrollBeyondLastLine: false,
    hover: {
      enabled: false,
    },
    guides: {
      indentation: false,
      bracketPairs: false,
      bracketPairsHorizontal: false,
    },
    padding: {
      top: 12,
    },
  };

  return (
    <Section>
      <H2Title
        title={t`MCP Server`}
        description={t`Access your workspace data from your favorite MCP client like Claude Desktop, Windsurf or Cursor.`}
      />
      <Card rounded>
        <StyledCoverCardContent divider>
          <StyledCoverImage
            style={{ backgroundImage: `url('${coverImage}')` }}
          />
        </StyledCoverCardContent>
        <StyledCoverCardContent>
          <StyledEditorContainer style={{ position: 'relative' }}>
            <StyledConfigButtonsContainer>
              <Select
                dropdownId="mcp-auth-method-select"
                value={authMethod}
                onChange={(value) => setAuthMethod(value as McpAuthMethod)}
                options={[
                  { label: t`OAuth`, value: 'oauth' },
                  { label: t`API Key`, value: 'api-key' },
                ]}
                selectSizeVariant="small"
                dropdownWidth={GenericDropdownContentWidth.Medium}
                dropdownOffset={{ x: 0, y: 4 }}
              />
              <StyledCopyButton
                Icon={IconCopy}
                onClick={() => {
                  copyToClipboard(
                    activeConfig,
                    t`MCP Configuration copied to clipboard`,
                  );
                }}
                size="small"
              />
            </StyledConfigButtonsContainer>
            <CodeEditor
              value={activeConfig}
              language="json"
              options={codeEditorOptions}
              height={editorHeight}
            />
          </StyledEditorContainer>
        </StyledCoverCardContent>
      </Card>
    </Section>
  );
};
