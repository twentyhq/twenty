import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import type { ThemeType } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNodeContainer = styled.div<{
  theme: ThemeType;
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

  background: ${({ theme, runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });
    return selected ? colors.selected.background : colors.unselected.background;
  }};

  border-color: ${({ theme, runStatus, selected }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });
    return selected
      ? colors.selected.borderColor
      : colors.unselected.borderColor;
  }};

  &:hover {
    background: ${({ theme, runStatus, selected }) => {
      const colors = getWorkflowDiagramColors({ theme, runStatus });
      const bg = selected
        ? colors.selected.background
        : colors.unselected.background;
      return `linear-gradient(0deg, ${themeCssVariables.background.transparent.lighter} 0%, ${themeCssVariables.background.transparent.lighter} 100%), ${bg}`;
    }};

    border-color: ${({ theme, runStatus, selected, isConnectable }) => {
      if (isConnectable === true) return themeCssVariables.color.blue;
      const colors = getWorkflowDiagramColors({ theme, runStatus });
      return selected
        ? colors.selected.borderColor
        : colors.unselected.borderColor;
    }};
  }
`;

export { StyledNodeContainer as WorkflowNodeContainer };
