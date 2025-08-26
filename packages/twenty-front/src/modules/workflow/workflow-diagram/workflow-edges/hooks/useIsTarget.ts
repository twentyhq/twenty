import { useConnection, useEdges } from '@xyflow/react';

export const useIsTarget = () => {
  const connection = useConnection();

  const edges = useEdges();

  const isConnectionInProgress = () => connection.inProgress;

  const isTarget = (targetId: string) => {
    if (!isConnectionInProgress()) {
      return true;
    }

    return !edges.some(
      (edge) =>
        edge.target === targetId &&
        connection.fromNode?.id &&
        edge.source === connection.fromNode.id,
    );
  };

  return { isTarget, isConnectionInProgress };
};
