import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

export const measureNodeGeometry = (node: Element): ElementGeometrySnapshot => {
  const { x, y, width, height } = node.getBoundingClientRect();

  const htmlNode = node instanceof HTMLElement ? node : null;

  return {
    x,
    y,
    width,
    height,
    offsetWidth: htmlNode?.offsetWidth ?? 0,
    offsetHeight: htmlNode?.offsetHeight ?? 0,
    offsetTop: htmlNode?.offsetTop ?? 0,
    offsetLeft: htmlNode?.offsetLeft ?? 0,
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
