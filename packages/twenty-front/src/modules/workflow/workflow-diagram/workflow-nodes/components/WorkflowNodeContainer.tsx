import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { styled } from '@linaria/react';
import type { ThemeType } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { css } from '@linaria/core';

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

  ${({ theme, runStatus, selected, isConnectable }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });

    const background = selected
      ? colors.selected.background
      : colors.unselected.background;

    return css`
      background: ${background};
      border-color: ${selected
        ? colors.selected.borderColor
        : colors.unselected.borderColor};

      &:hover {
        background: linear-gradient(
            0deg,
            ${themeCssVariables.background.transparent.lighter} 0%,
            ${themeCssVariables.background.transparent.lighter} 100%
          ),
          ${background};

        ${isConnectable
          ? css`
              border-color: ${themeCssVariables.color.blue} !important;
            `
          : ''};
      }
    `;
  }}
`;

export { StyledNodeContainer as WorkflowNodeContainer };
