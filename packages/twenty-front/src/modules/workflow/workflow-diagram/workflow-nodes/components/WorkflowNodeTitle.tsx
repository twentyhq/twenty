import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNodeTitle = styled.div<{
  highlight?: boolean;
  runStatus?: WorkflowRunStepStatus;
  selected: boolean;
}>`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  align-self: stretch;
  box-sizing: border-box;
  color: ${({ highlight, runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ runStatus });
    if (highlight === true) return colors.selected.titleColor;
    return selected ? colors.selected.titleColor : colors.unselected.titleColor;
  }};
  display: -webkit-box;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;

  text-overflow: ellipsis;
`;

export { StyledNodeTitle as WorkflowNodeTitle };
