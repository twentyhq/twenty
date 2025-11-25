import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Label } from 'twenty-ui/display';

const StyledNodeLabel = styled(Label)<{
  runStatus?: WorkflowRunStepStatus;
  selected: boolean;
}>`
  box-sizing: border-box;
  flex: 1 0 0;

  ${({ theme, runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });

    return css`
      color: ${selected ? colors.selected.color : colors.unselected.color};
    `;
  }}
`;

export { StyledNodeLabel as WorkflowNodeLabel };
