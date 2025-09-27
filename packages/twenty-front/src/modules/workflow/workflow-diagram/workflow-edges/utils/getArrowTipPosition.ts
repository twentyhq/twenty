import { Position } from '@xyflow/react';

export const getArrowTipPosition = ({
  targetX,
  targetY,
  targetPosition,
}: {
  targetX: number;
  targetY: number;
  targetPosition: Position;
}): { x: number; y: number } => {
  const offset = 8;

  switch (targetPosition) {
    case Position.Top:
      return { x: targetX, y: targetY - offset };
    case Position.Bottom:
      return { x: targetX, y: targetY + offset };
    case Position.Left:
      return { x: targetX - offset, y: targetY };
    case Position.Right:
      return { x: targetX + offset, y: targetY };
    default:
      return { x: targetX, y: targetY - offset };
  }
};
