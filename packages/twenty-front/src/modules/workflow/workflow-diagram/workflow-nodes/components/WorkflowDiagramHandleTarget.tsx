import { WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultTargetHandleId';
import { WorkflowDiagramHandleTargetEffect } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleTargetEffect';
import { styled } from '@linaria/react';
import { Handle, Position, useNodeId } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type WorkflowDiagramHandleTargetProps = {
  isConnectable?: boolean;
  targetHandleIds?: string[];
};

const StyledHandleContainer = styled.div`
  inset: 0;
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

const StyledBranchHandle = styled(Handle)`
  opacity: 0;
  pointer-events: none;
`;

export const WorkflowDiagramHandleTarget = ({
  isConnectable = false,
  targetHandleIds,
}: WorkflowDiagramHandleTargetProps) => {
  const nodeId = useNodeId();
  const targetHandlesKey = targetHandleIds?.join(',');

  return (
    <>
      {isDefined(nodeId) && (
        <WorkflowDiagramHandleTargetEffect
          nodeId={nodeId}
          targetHandlesKey={targetHandlesKey}
        />
      )}
      <StyledHandleContainer>
        <Handle
          id={WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID}
          type="target"
          position={Position.Top}
          isConnectableEnd={isConnectable}
          isConnectableStart={false}
        />
      </StyledHandleContainer>
      {targetHandleIds?.map((handleId, index) => (
        <StyledBranchHandle
          key={handleId}
          id={handleId}
          type="target"
          position={Position.Top}
          isConnectableEnd={isConnectable}
          isConnectableStart={false}
          style={{
            left: `${((index + 1) / (targetHandleIds.length + 1)) * 100}%`,
          }}
        />
      ))}
    </>
  );
};
