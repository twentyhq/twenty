import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { type McpToolTestData } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/types/McpToolTestData';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isEmptyObject } from 'twenty-shared/utils';
import { JsonTree } from 'twenty-ui/components/data-display';
import { Callout } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledJsonTreeContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

type McpToolTestResultProps = {
  output: McpToolTestData['output'];
  isTesting: boolean;
};

export const McpToolTestResult = ({
  output,
  isTesting,
}: McpToolTestResultProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  if (isTesting) {
    return <Callout status="neutral" title={t`Running the tool...`} />;
  }

  if (output.status === 'idle') {
    return (
      <Callout
        status="neutral"
        title={t`No test result yet`}
        description={t`Run a test to see what the tool returns and use its fields in the next steps.`}
      />
    );
  }

  if (output.status === 'error') {
    return (
      <Callout
        status="error"
        title={t`The tool call failed`}
        description={output.error}
      />
    );
  }

  if (isEmptyObject(output.result)) {
    return (
      <Callout
        status="neutral"
        title={t`No output returned`}
        description={t`The tool ran but returned no fields, so the expected output was left unchanged.`}
      />
    );
  }

  return (
    <StyledContainer>
      <Callout
        status="success"
        title={t`Output saved`}
        description={t`The fields below are now available as variables in the next steps.`}
      />
      <div>
        <InputLabel>{t`Result`}</InputLabel>
        <StyledJsonTreeContainer>
          <JsonTree
            value={output.result}
            emptyArrayLabel={t`Empty Array`}
            emptyObjectLabel={t`Empty Object`}
            emptyStringLabel={t`[empty string]`}
            arrowButtonCollapsedLabel={t`Expand`}
            arrowButtonExpandedLabel={t`Collapse`}
            onNodeValueClick={copyToClipboard}
          />
        </StyledJsonTreeContainer>
      </div>
    </StyledContainer>
  );
};
