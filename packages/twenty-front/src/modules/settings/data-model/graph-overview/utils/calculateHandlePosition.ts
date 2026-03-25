export const calculateHandlePosition = (
  sourceNodeWidth: number,
  sourceNodeX: number,
  targetNodeWidth: number,
  targetNodeX: number,
  type: 'source' | 'target',
) => {
  if (type === 'source') {
    if (
      sourceNodeX > targetNodeX + targetNodeWidth ||
      sourceNodeX + sourceNodeWidth > targetNodeX
    ) {
      return 'left';
    }
    return 'right';
  }

  if (type === 'target') {
    if (sourceNodeX > targetNodeX + targetNodeWidth) {
      return 'right';
    }
    return 'left';
  }
};
