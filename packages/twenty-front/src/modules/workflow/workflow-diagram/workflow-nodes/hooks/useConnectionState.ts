import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { workflowReconnectingEdgeComponentState } from '@/workflow/workflow-diagram/states/workflowReconnectingEdgeComponentState';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useConnection, useEdges } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useConnectionState = (nodeType: 'action' | 'trigger') => {
  const connection = useConnection();

  const edges = useEdges<WorkflowDiagramEdge>();
  const workflowReconnectingEdge = useAtomComponentStateValue(
    workflowReconnectingEdgeComponentState,
  );

  const isConnectionInProgress = connection.inProgress;

  const isConnectable = ({ nodeId }: { nodeId: string }) => {
    if (nodeType === 'trigger') {
      return false;
    }

    if (!isConnectionInProgress) {
      return false;
    }

    if (connection.fromNode.id === nodeId) {
      return false;
    }

    if (
      isDefined(workflowReconnectingEdge) &&
      workflowReconnectingEdge.forbiddenTargetStepIds.has(nodeId)
    ) {
      return false;
    }

    const edgeAlreadyExists = edges.some(
      (edge) =>
        edge.id !== workflowReconnectingEdge?.id &&
        edge.source === connection.fromNode.id &&
        edge.sourceHandle === connection.fromHandle.id &&
        edge.target === nodeId &&
        (!isDefined(workflowReconnectingEdge) ||
          isDeeplyEqual(
            edge.data?.sourceConnectionOptions,
            workflowReconnectingEdge.data?.sourceConnectionOptions,
          )),
    );

    return !edgeAlreadyExists;
  };

  const isConnectingSource = ({
    nodeId,
    sourceHandleId,
  }: {
    nodeId: string;
    sourceHandleId: string;
  }) => {
    return (
      connection.inProgress &&
      connection.fromNode.id === nodeId &&
      connection.fromHandle.id === sourceHandleId
    );
  };

  return { isConnectable, isConnectingSource, isConnectionInProgress };
};
