import { useConnection, useEdges } from '@xyflow/react';

export const useIsConnectable = () => {
  const connection = useConnection();

  const edges = useEdges();

  const isConnectable = (nodeId: string) => {
    if (!connection.inProgress) {
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

  return { isConnectable };
};
