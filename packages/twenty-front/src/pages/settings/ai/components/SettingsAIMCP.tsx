import { useState } from 'react';

import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconCopy, IconPlug } from 'twenty-ui/display';
import { Button, CodeEditor } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledConfigWrapper = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  margin: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]};
`;

const StyledCopyButton = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[3]};
  top: ${themeCssVariables.spacing[3]};
  z-index: 1;
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

export const SettingsAIMCP = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const [authMethod, setAuthMethod] = useState<McpAuthMethod>('oauth');

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
        description={t`Access your workspace data from your favorite MCP client like Claude Desktop, Claude Code, Cursor, or ChatGPT. Once connected, try: "Show me the 5 most recently created companies" or "Create a new person named Jane Doe".`}
      />
      <Card rounded>
        <SettingsOptionCardContentSelect
          Icon={IconPlug}
          title={t`Authentication method`}
          description={t`OAuth or API Key`}
        >
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
          />
        </SettingsOptionCardContentSelect>
        <StyledConfigWrapper>
          <StyledEditorContainer style={{ position: 'relative' }}>
            <StyledCopyButton>
              <Button
                Icon={IconCopy}
                onClick={() => {
                  copyToClipboard(
                    activeConfig,
                    t`MCP Configuration copied to clipboard`,
                  );
                }}
                type="button"
              />
            </StyledCopyButton>
            <CodeEditor
              value={activeConfig}
              language="application/json"
              options={codeEditorOptions}
              height={editorHeight}
            />
          </StyledEditorContainer>
        </StyledConfigWrapper>
      </Card>
    </Section>
  );
};
