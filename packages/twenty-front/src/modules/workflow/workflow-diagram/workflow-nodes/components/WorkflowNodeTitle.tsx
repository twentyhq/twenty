import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import type { ThemeType } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { css } from '@linaria/core';

const StyledNodeTitle = styled.div<{
  theme: ThemeType;
  highlight?: boolean;
  runStatus?: WorkflowRunStepStatus;
  selected: boolean;
}>`
  box-sizing: border-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  align-self: stretch;
  display: -webkit-box;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
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
