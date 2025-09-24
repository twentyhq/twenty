import { type Position } from '@/workflow/workflow-diagram/workflow-edges/utils/getDragPosition';
import { isSafeCoordinate } from '@/workflow/workflow-diagram/workflow-edges/utils/isSafeCoordinate';
import { getBezierPath } from '@xyflow/react';

export const computePath = (
  sourcePosition: Position,
  targetPosition: Position,
): string => {
  const safeSourceX = isSafeCoordinate(sourcePosition.x, 0);
  const safeSourceY = isSafeCoordinate(sourcePosition.y, 0);
  const safeTargetX = isSafeCoordinate(targetPosition.x, 100);
  const safeTargetY = isSafeCoordinate(targetPosition.y, 100);

  try {
    const path = getBezierPath({
      sourceX: safeSourceX,
      sourceY: safeSourceY + 4,
      targetX: safeTargetX,
      targetY: safeTargetY - 4,
    });
    return path[0] || '';
  } catch {
    return '';
  }
};
