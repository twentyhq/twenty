import { isSafeCoordinate } from '@/workflow/workflow-diagram/workflow-edges/utils/isSafeCoordinate';

export type Position = { x: number; y: number };

export const getDragPosition = (
  startPosition: Position,
  mouseStart: Position,
  currentMouse: Position,
): Position => {
  const deltaX = currentMouse.x - mouseStart.x;
  const deltaY = currentMouse.y - mouseStart.y;

  const computedX = isSafeCoordinate(startPosition.x + deltaX, startPosition.x);
  const computedY = isSafeCoordinate(startPosition.y + deltaY, startPosition.y);

  return { x: computedX, y: computedY };
};
