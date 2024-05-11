import { internalsSymbol, Node, Position } from 'reactflow';

import { RelationMetadataType } from '~/generated-metadata/graphql';

export const calculateSourcePosition = (
  sourceNodeWidth: number,
  sourceNodeX: number,
  targetNodeWidth: number,
  targetNodeY: number,
) => {
  if (sourceNodeX > targetNodeY + targetNodeWidth) {
    return 'top';
  } else if (
    sourceNodeX > targetNodeY &&
    sourceNodeX < targetNodeY + targetNodeWidth
  ) {
    return 'bottom';
  } else if (sourceNodeX + sourceNodeWidth > targetNodeY) {
    return 'top';
  } else {
    return 'bottom';
  }
};
export const calculateTargetPosition = (
  sourceNodeWidth: number,
  sourceNodeX: number,
  targetNodeWidth: number,
  targetNodeX: number,
) => {
  if (sourceNodeX > targetNodeX + targetNodeWidth) {
    return 'right';
  } else if (
    sourceNodeX > targetNodeX &&
    sourceNodeX < targetNodeX + targetNodeWidth
  ) {
    return 'right';
  } else if (sourceNodeX + sourceNodeWidth > targetNodeX) {
    return 'left';
  } else {
    return 'left';
  }
};
export const edgeMarkerNameTarget = (edgeConfig: any) => {
  const markerName =
    (edgeConfig.data.relation as RelationMetadataType) === 'ONE_TO_ONE'
      ? 'hasOne'
      : 'hasMany';

  return markerName;
};
export const edgeMarkerNameSource = (edgeConfig: any) => {
  const markerName =
    (edgeConfig.data.relation as RelationMetadataType) === 'ONE_TO_MANY'
      ? 'hasOne'
      : 'hasMany';

  return markerName;
};
const getNodeCenter = (node: Node) => {
  if (!node.positionAbsolute) {
    return {
      x: 0,
      y: 0,
    };
  }
  return {
    x: node.positionAbsolute.x + (node.width ?? 0) / 2,
    y: node.positionAbsolute.y + (node.height ?? 0) / 2,
  };
};
const getParams = (nodeA: Node, nodeB: Node): [number, number, Position] => {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let position;

  // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
  if (horizontalDiff > verticalDiff) {
    position = centerA.x > centerB.x ? Position.Left : Position.Right;
  } else {
    // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position];
};

const getHandleCoordsByPosition = (node: Node, handlePosition: Position) => {
  // all handles are from type source, that's why we use handleBounds.source here
  const handle = node[internalsSymbol]?.handleBounds?.source?.find(
    (h) => h.position === handlePosition,
  );
  if (!handle || !node.positionAbsolute) {
    return [0, 0];
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // this is a tiny detail to make the markerEnd of an edge visible.
  // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
  // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle.height;
      break;
  }

  const x = node.positionAbsolute.x + handle.x + offsetX;
  const y = node.positionAbsolute.y + handle.y + offsetY;

  return [x, y];
};
export const getEdgeParams = (source: Node, target: Node) => {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
};
