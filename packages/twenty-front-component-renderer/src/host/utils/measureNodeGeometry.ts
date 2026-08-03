import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

type MeasureNodeGeometryInput = {
  node: Element;
  rootContainerOrigin: {
    x: number;
    y: number;
  };
};

export const measureNodeGeometry = ({
  node,
  rootContainerOrigin,
}: MeasureNodeGeometryInput): ElementGeometrySnapshot => {
  const { x, y, width, height } = node.getBoundingClientRect();

  const htmlNode = node instanceof HTMLElement ? node : null;

  return {
    x,
    y,
    width,
    height,
    offsetWidth: htmlNode?.offsetWidth ?? 0,
    offsetHeight: htmlNode?.offsetHeight ?? 0,
    offsetTop: y - rootContainerOrigin.y,
    offsetLeft: x - rootContainerOrigin.x,
    clientWidth: node.clientWidth,
    clientHeight: node.clientHeight,
    clientTop: node.clientTop,
    clientLeft: node.clientLeft,
    scrollWidth: node.scrollWidth,
    scrollHeight: node.scrollHeight,
    scrollTop: node.scrollTop,
    scrollLeft: node.scrollLeft,
  };
};
