import { useConnection, useEdges } from '@xyflow/react';

export const useConnectionState = (nodeType: 'action' | 'trigger') => {
  const connection = useConnection();

  const edges = useEdges();

  const isInProgressConnection = connection.inProgress;

  const isConnectable = (nodeId: string) => {
    if (nodeType === 'trigger') {
      return false;
    }

    if (!isInProgressConnection) {
      return false;
    }

    if (connection.fromNode.id === nodeId) {
      return false;
    }

    return !edges.some(
      (edge) =>
        edge.target === nodeId &&
        connection.fromNode?.id &&
        edge.source === connection.fromNode.id,
    );
  };

  const isSourceConnected = (nodeId: string) => {
    return connection.inProgress && connection.fromNode.id === nodeId;
  };

  return { isConnectable, isSourceConnected, isInProgressConnection };
};
