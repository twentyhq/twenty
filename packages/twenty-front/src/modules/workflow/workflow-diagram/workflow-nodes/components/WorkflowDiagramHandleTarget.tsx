import { WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultTargetHandleId';
import { styled } from '@linaria/react';
import { Handle, Position } from '@xyflow/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type WorkflowDiagramHandleTargetProps = {
  isConnectable?: boolean;
};

const StyledHandleContainer = styled.div`
  position: absolute;

  & .react-flow__handle {
    border-radius: ${themeCssVariables.border.radius.md};
    height: 100%;
    left: 0;
    opacity: 0;
    top: 0;
    transform: translate(-1px, -5px);
    width: 100%;
    z-index: 1;

    &.connectionindicator {
      cursor: pointer;
    }
  }
`;

export const WorkflowDiagramHandleTarget = ({
  isConnectable = false,
}: WorkflowDiagramHandleTargetProps) => {
  return (
    <StyledHandleContainer>
      <Handle
        id={WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID}
        type="target"
        position={Position.Top}
        isConnectableEnd={isConnectable}
        isConnectableStart={false}
      />
    </StyledHandleContainer>
  );
};
