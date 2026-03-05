import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNodeContainer = styled.div<{
  runStatus?: WorkflowRunStepStatus;
  isConnectable?: boolean;
  selected: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  max-width: 240px;
  min-width: 44px;
  padding: ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.md};
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  transition: border-color 0.1s;

  background: ${({ runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ runStatus });
    return selected ? colors.selected.background : colors.unselected.background;
  }};

  border-color: ${({ runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ runStatus });
    return selected
      ? colors.selected.borderColor
      : colors.unselected.borderColor;
  }};

  &:hover {
    background: ${({ runStatus, selected }) => {
      const colors = getWorkflowDiagramColors({ runStatus });
      const bg = selected
        ? colors.selected.background
        : colors.unselected.background;
      return `linear-gradient(0deg, ${themeCssVariables.background.transparent.lighter} 0%, ${themeCssVariables.background.transparent.lighter} 100%), ${bg}`;
    }};

    border-color: ${({ runStatus, selected, isConnectable }) => {
      if (isConnectable === true) return themeCssVariables.color.blue;
      const colors = getWorkflowDiagramColors({ runStatus });
      return selected
        ? colors.selected.borderColor
        : colors.unselected.borderColor;
    }};
  }
`;

export { StyledNodeContainer as WorkflowNodeContainer };
