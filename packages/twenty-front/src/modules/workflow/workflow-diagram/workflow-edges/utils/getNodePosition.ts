import { type Position } from '@/workflow/workflow-diagram/workflow-edges/utils/getDragPosition';
import { isSafeCoordinate } from '@/workflow/workflow-diagram/workflow-edges/utils/isSafeCoordinate';

export const getNodePosition = (
  nodePosition: Position,
  nodeSize: { width?: number; height?: number },
): Position => {
  const width = nodeSize.width ?? 200;
  const height = nodeSize.height ?? 100;

  return {
    x: isSafeCoordinate(nodePosition.x + width / 2, nodePosition.x),
    y: isSafeCoordinate(nodePosition.y + height, nodePosition.y),
  };
};
