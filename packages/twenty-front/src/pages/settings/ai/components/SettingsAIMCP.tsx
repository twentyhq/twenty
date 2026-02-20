import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconCopy } from 'twenty-ui/display';
import { Button, CodeEditor } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledCopyButton = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(3)};
  right: ${({ theme }) => theme.spacing(3)};
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

export const SettingsAIMCP = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const mcpConfig = JSON.stringify(
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

  return (
    <Section>
      <H2Title
        title={t`MCP Server`}
        description={t`Access your workspace data from your favorite MCP client like Claude Desktop, Windsurf or Cursor.`}
      />
      <StyledWrapper>
        <StyledEditorContainer style={{ position: 'relative' }}>
          <StyledCopyButton>
            <Button
              Icon={IconCopy}
              onClick={() => {
                copyToClipboard(
                  mcpConfig,
                  t`MCP Configuration copied to clipboard`,
                );
              }}
              type="button"
            />
          </StyledCopyButton>
          <CodeEditor
            value={mcpConfig}
            language="application/json"
            options={{
              readOnly: true,
              domReadOnly: true,
              renderLineHighlight: 'none',
              renderLineHighlightOnlyWhenFocus: false,
              lineNumbers: 'off',
              folding: false,
              selectionHighlight: false,
              occurrencesHighlight: 'off',
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
            }}
            height="220px"
          />
        </StyledEditorContainer>
      </StyledWrapper>
    </Section>
  );
};
