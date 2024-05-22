export const calculateSourcePosition = (
  sourceNodeWidth: number,
  sourceNodeX: number,
  targetNodeWidth: number,
  targetNodeX: number,
) => {
  if (sourceNodeX > targetNodeX + targetNodeWidth) {
    return 'left';
  } else if (
    sourceNodeX > targetNodeX &&
    sourceNodeX < targetNodeX + targetNodeWidth
  ) {
    return 'right';
  } else if (sourceNodeX + sourceNodeWidth > targetNodeX) {
    return 'left';
  }
  return 'right';
};
export const calculateTargetPosition = (
  sourceNodeWidth: number,
  sourceNodeX: number,
  targetNodeWidth: number,
  targetNodeX: number,
) => {
  if (
    sourceNodeX > targetNodeX + targetNodeWidth ||
    (sourceNodeX > targetNodeX && sourceNodeX < targetNodeX + targetNodeWidth)
  ) {
    return 'right';
  }
  return 'left';
};

export const calculatePosition = (
  sourceNodeWidth: number,
  sourceNodeX: number,
  targetNodeWidth: number,
  targetNodeX: number,
  type: 'source' | 'target',
) => {
  if (type === 'source') {
    if (sourceNodeX > targetNodeX + targetNodeWidth) return 'left';
    if (
      sourceNodeX > targetNodeX &&
      sourceNodeX < targetNodeX + targetNodeWidth
    )
      return 'right';
    if (sourceNodeX + sourceNodeWidth > targetNodeX) return 'left';
    return 'right';
  }

  if (type === 'target') {
    if (
      sourceNodeX > targetNodeX + targetNodeWidth ||
      (sourceNodeX > targetNodeX && sourceNodeX < targetNodeX + targetNodeWidth)
    )
      return 'right';
    return 'left';
  }
};
