import { useConnection, useEdges } from '@xyflow/react';

export const useConnectionState = (nodeType: 'action' | 'trigger') => {
  const connection = useConnection();

  const edges = useEdges();

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

    const edgeAlreadyExists = edges.some(
      (edge) =>
        edge.source === connection.fromNode.id &&
        edge.sourceHandle === connection.fromHandle.id &&
        edge.target === nodeId,
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
