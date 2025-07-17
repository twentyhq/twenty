import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconCopy, IconDatabase, IconSitemap } from 'twenty-ui/display';
import { Button, CodeEditor } from 'twenty-ui/input';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledImage = styled.img`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledSchemaSelector = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
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

export const SettingsIntegrationMCP = () => {
  const theme = useTheme();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { t } = useLingui();

  const generateMcpContent = (pathSuffix: string, serverName: string) => {
    return JSON.stringify(
      {
        mcpServers: {
          [serverName]: {
            type: 'remote',
            url: `${REACT_APP_SERVER_BASE_URL}${pathSuffix}`,
            headers: {
              Authorization: 'Bearer [API_KEY]',
            },
          },
        },
      },
      null,
      2,
    );
  };

  const options = [
    {
      label: 'Core Schema',
      value: 'core-schema',
      Icon: IconDatabase,
      content: generateMcpContent('/mcp', 'twenty'),
    },
    {
      label: 'Metadata Schema',
      value: 'metadata-schema',
      Icon: IconSitemap,
      content: generateMcpContent('/mcp/metadata', 'twenty-metadata'),
    },
  ];
  const [selectedSchemaValue, setSelectedSchemaValue] = useState(
    options[0].value,
  );

  const selectedOption =
    options.find((option) => option.value === selectedSchemaValue) ||
    options[0];

  const onChange = (value: string) => {
    setSelectedSchemaValue(value);
  };

  return (
    <StyledWrapper>
      <StyledImage
        src={`/images/integrations/integration-mcp-cover-${theme.name}.svg`}
      />
      <StyledSchemaSelector>
        <Select
          dropdownId="mcp-schema-selector"
          value={selectedSchemaValue}
          options={options}
          onChange={onChange}
        />
        <StyledLabel>
          <Trans>Interact with your workspace data</Trans>
        </StyledLabel>
      </StyledSchemaSelector>
      <StyledEditorContainer style={{ position: 'relative' }}>
        <StyledCopyButton>
          <Button
            Icon={IconCopy}
            onClick={() => {
              enqueueSuccessSnackBar({
                message: t`MCP Configuration copied to clipboard`,
                options: {
                  icon: <IconCopy size={theme.icon.size.md} />,
                  duration: 2000,
                },
              });
              navigator.clipboard.writeText(selectedOption.content);
            }}
            type="button"
          />
        </StyledCopyButton>
        <CodeEditor
          value={selectedOption.content}
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
  );
};
