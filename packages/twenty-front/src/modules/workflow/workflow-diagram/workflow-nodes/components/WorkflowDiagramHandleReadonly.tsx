import { NODE_HANDLE_HEIGHT_PX } from '@/workflow/workflow-diagram/constants/NodeHandleHeightPx';
import { NODE_HANDLE_WIDTH_PX } from '@/workflow/workflow-diagram/constants/NodeHandleWidthPx';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Handle, type HandleProps } from '@xyflow/react';

type WorkflowDiagramHandleReadonlyProps = HandleProps & {
  selected: boolean;
};

const StyledHandle = styled(Handle)<{
  selected: boolean;
}>`
  &.react-flow__handle {
    height: ${NODE_HANDLE_HEIGHT_PX}px;
    width: ${NODE_HANDLE_WIDTH_PX}px;
    border-color: ${({ theme, selected }) =>
      selected ? theme.color.blue : theme.border.color.strong};
    background: ${({ theme, selected }) =>
      selected ? theme.adaptiveColors.blue1 : theme.background.primary};
    transition:
      transform 0.1s ease-out,
      background 0.1s,
      border-color 0.1s;
    z-index: 1;

    ${({ position }) => {
      if (position === 'top') {
        return css`
          transform: translate(-50%, -50%);
          transform-origin: top left;
        `;
      } else if (position === 'bottom') {
        return css`
          transform: translate(-50%, 50%);
          transform-origin: bottom left;
        `;
      }
    }}

    &.connectionindicator {
      cursor: default;
    }
  }
`;

export const WorkflowDiagramHandleReadonly = ({
  type,
  position,
  selected,
}: WorkflowDiagramHandleReadonlyProps) => {
  return <StyledHandle type={type} position={position} selected={selected} />;
};
