import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

const StyledNodeTitle = styled.div<{
  highlight?: boolean;
  runStatus?: WorkflowRunStepStatus;
}>`
  box-sizing: border-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  align-self: stretch;
  display: -webkit-box;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ theme, highlight, runStatus }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });

    if (true === highlight) {
      return css`
        color: ${colors.selected.titleColor};
      `;
    }

    return css`
      color: ${colors.unselected.titleColor};

      .selected & {
        color: ${colors.selected.titleColor};
      }
    `;
  }}
`;

export { StyledNodeTitle as WorkflowNodeTitle };
