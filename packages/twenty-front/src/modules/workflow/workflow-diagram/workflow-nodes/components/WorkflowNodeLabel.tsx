import styled from '@emotion/styled';
import { Label } from 'twenty-ui/display';
import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { css } from '@emotion/react';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';

const StyledNodeLabel = styled(Label)<{
  runStatus?: WorkflowRunStepStatus;
}>`
  box-sizing: border-box;
  flex: 1 0 0;

  ${({ theme, runStatus }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });

    return css`
      color: ${colors.unselected.color};

      .selected & {
        color: ${colors.selected.color};
      }
    `;
  }}
`;

export { StyledNodeLabel as WorkflowNodeLabel };
