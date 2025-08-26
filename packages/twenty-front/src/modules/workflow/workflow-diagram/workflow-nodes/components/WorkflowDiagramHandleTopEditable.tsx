import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { css } from '@emotion/react';

type WorkflowDiagramHandleTopEditableProps = {
  isConnectable?: boolean;
};

const StyledHandle = styled(Handle, {
  shouldForwardProp: (prop) => prop !== 'isConnectable',
})<{
  isConnectable?: boolean;
}>`
  &.react-flow__handle {
    opacity: 0;
    z-index: 1;
    ${({ theme, isConnectable }) =>
      isConnectable &&
      css`
        height: 100%;
        width: 100%;
        border-radius: ${theme.border.radius.md};

        transform: translate(-1px, -1px);
        top: 0;
        left: 0;

        &.connectionindicator {
          cursor: pointer;
        }
      `}
  }
`;

export const WorkflowDiagramHandleTopEditable = ({
  isConnectable = false,
}: WorkflowDiagramHandleTopEditableProps) => {
  return (
    <StyledHandle
      type={'target'}
      position={Position.Top}
      isConnectable={isConnectable}
    />
  );
};
