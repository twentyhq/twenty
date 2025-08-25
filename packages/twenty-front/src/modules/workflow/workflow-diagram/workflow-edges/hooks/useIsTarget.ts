import { useConnection, useEdges } from '@xyflow/react';

export const useIsTarget = () => {
  const connection = useConnection();

  const edges = useEdges();

  const isTarget = (targetId: string) => {
    if (!connection.inProgress) {
      return true;
    }

    return !edges.some(
      (edge) =>
        edge.target === targetId && edge.source === connection.fromNode.id,
    );
  };

  return { isTarget };
};
