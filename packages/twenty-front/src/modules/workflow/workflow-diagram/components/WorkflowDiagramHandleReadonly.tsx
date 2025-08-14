import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import styled from '@emotion/styled';
import { Handle } from '@xyflow/react';

const StyledHandle = styled(Handle)<{
  selected: boolean;
}>`
  height: ${NODE_HANDLE_HEIGHT_PX}px !important;
  width: ${NODE_HANDLE_WIDTH_PX}px !important;
  border-color: ${({ theme, selected }) =>
    selected ? theme.color.blue : theme.border.color.strong} !important;
  background: ${({ theme, selected }) =>
    selected
      ? theme.adaptiveColors.blue1
      : theme.background.primary} !important;
  transition:
    transform 0.1s ease-out,
    background 0.1s,
    border-color 0.1s !important;
  z-index: 1 !important;
`;

export { StyledHandle as WorkflowDiagramHandleReadonly };
