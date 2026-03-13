import { useState } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { H2Title, H3Title, IconCopy } from 'twenty-ui/display';
import { Button, CodeEditor } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledWrapper = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
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

const StyledMethodToggle = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
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
        description={t`Access your workspace data from your favorite MCP client like Claude Desktop, Windsurf or Cursor.`}
      />
      <StyledMethodToggle>
        <Button
          title={t`OAuth (Recommended)`}
          variant={isOAuth ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setAuthMethod('oauth')}
        />
        <Button
          title={t`API Key`}
          variant={!isOAuth ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setAuthMethod('api-key')}
        />
      </StyledMethodToggle>
      <H3Title
        title={
          isOAuth
            ? t`OAuth — automatic login via browser`
            : t`API Key — manual token in headers`
        }
      />
      <StyledWrapper>
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
      </StyledWrapper>
    </Section>
  );
};
