import { WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultTargetHandleId';
import { styled } from '@linaria/react';
import {
  Handle,
  Position,
  useNodeId,
  useUpdateNodeInternals,
} from '@xyflow/react';
import { useEffect } from 'react';
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
  const updateNodeInternals = useUpdateNodeInternals();
  const targetHandlesKey = targetHandleIds?.join(',');

  useEffect(() => {
    // React Flow caches handle geometry independently of node data.
    if (isDefined(nodeId)) {
      updateNodeInternals(nodeId);
    }
  }, [nodeId, targetHandlesKey, updateNodeInternals]);

  return (
    <>
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
