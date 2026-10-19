import { isDefined } from 'twenty-shared/utils';

export const measureSvgBoundingBox = (
  node: Element,
): { width: number; height: number } | null => {
  if (
    !(node instanceof SVGGraphicsElement) ||
    !isDefined(node.ownerSVGElement)
  ) {
    return null;
  }

  try {
    const { width, height } = node.getBBox();

    return { width, height };
  } catch {
    return null;
  }
};
