import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledNodeTitle = styled.div<{
  highlight?: boolean;
  runStatus?: WorkflowRunStepStatus;
  selected: boolean;
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

  ${({ theme, highlight, runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });

    if (true === highlight) {
      return css`
        color: ${colors.selected.titleColor};
      `;
    }

    return css`
      color: ${selected
        ? colors.selected.titleColor
        : colors.unselected.titleColor};
    `;
  }}
`;

export { StyledNodeTitle as WorkflowNodeTitle };
