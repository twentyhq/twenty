import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledNodeContainer = styled.div<{
  runStatus?: WorkflowRunStepStatus;
  isConnectable?: boolean;
  selected: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 240px;
  min-width: 44px;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.md};
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
            ${theme.background.transparent.lighter} 0%,
            ${theme.background.transparent.lighter} 100%
          ),
          ${background};

        ${isConnectable &&
        css`
          border-color: ${theme.color.blue} !important;
        `};
      }
    `;
  }}
`;

export { StyledNodeContainer as WorkflowNodeContainer };
