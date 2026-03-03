import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import type { ThemeType } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
const StyledNodeTitle = styled.div<{
  theme: ThemeType;
  highlight?: boolean;
  runStatus?: WorkflowRunStepStatus;
  selected: boolean;
}>`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  align-self: stretch;
  box-sizing: border-box;
  color: ${({ theme, highlight, runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });
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
