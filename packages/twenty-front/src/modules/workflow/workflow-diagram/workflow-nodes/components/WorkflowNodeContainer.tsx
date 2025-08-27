import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

const StyledNodeContainer = styled.div<{
  runStatus?: WorkflowRunStepStatus;
  isConnectable?: boolean;
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

  &:hover {
    background: linear-gradient(
        0deg,
        ${({ theme }) => theme.background.transparent.lighter} 0%,
        ${({ theme }) => theme.background.transparent.lighter} 100%
      ),
      ${({ theme }) => theme.background.secondary};
    ${({ theme, isConnectable }) =>
      isConnectable &&
      css`
        border-color: ${theme.color.blue} !important;
      `};
  }

  ${({ theme, runStatus }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });

    return css`
      border-color: ${colors.unselected.borderColor};
      background: ${colors.unselected.background};

      .selected & {
        background-color: ${colors.selected.background};
        border: 1px solid ${colors.selected.borderColor};
      }
    `;
  }}
`;

export { StyledNodeContainer as WorkflowNodeContainer };
