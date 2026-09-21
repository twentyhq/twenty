import { useUpdateNodeInternals } from '@xyflow/react';
import { useEffect } from 'react';

export const WorkflowDiagramHandleTargetEffect = ({
  nodeId,
  targetHandlesKey,
}: {
  nodeId: string;
  targetHandlesKey?: string;
}) => {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    // React Flow caches handle geometry independently of node data.
    updateNodeInternals(nodeId);
  }, [nodeId, targetHandlesKey, updateNodeInternals]);

  return null;
};
