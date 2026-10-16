import { isDefined } from 'twenty-shared/utils';
import { measureComputedLayoutStyle } from '@/host/geometry/utils/measureComputedLayoutStyle';
import { measureSvgBoundingBox } from '@/host/geometry/utils/measureSvgBoundingBox';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

type MeasureNodeGeometryInput = {
  node: Element;
  resolveRemoteElementId?: (node: Element) => string | null;
  measureTextareaIntrinsicScrollHeight?: (node: Element) => number | undefined;
  rootContainerOrigin: {
    x: number;
    y: number;
  };
};

export const measureNodeGeometry = ({
  node,
  rootContainerOrigin,
  resolveRemoteElementId,
  measureTextareaIntrinsicScrollHeight,
}: MeasureNodeGeometryInput): ElementGeometrySnapshot => {
  const { x, y, width, height } = node.getBoundingClientRect();

  const htmlNode = node instanceof HTMLElement ? node : null;

  const offsetParent = htmlNode?.offsetParent;
  const offsetParentRemoteElementId =
    offsetParent instanceof Element
      ? (resolveRemoteElementId?.(offsetParent) ?? null)
      : null;
  const hasOwnedOffsetParent = isDefined(offsetParentRemoteElementId);
  const svgBoundingBox = measureSvgBoundingBox(node);

  return {
    offsetParentRemoteElementId,
    x,
    y,
    width,
    height,
    offsetWidth: htmlNode?.offsetWidth ?? 0,
    offsetHeight: htmlNode?.offsetHeight ?? 0,
    offsetTop: hasOwnedOffsetParent
      ? (htmlNode?.offsetTop ?? 0)
      : y - rootContainerOrigin.y,
    offsetLeft: hasOwnedOffsetParent
      ? (htmlNode?.offsetLeft ?? 0)
      : x - rootContainerOrigin.x,
    clientWidth: node.clientWidth,
    clientHeight: node.clientHeight,
    clientTop: node.clientTop,
    clientLeft: node.clientLeft,
    scrollWidth: node.scrollWidth,
    scrollHeight: node.scrollHeight,
    scrollTop: node.scrollTop,
    scrollLeft: node.scrollLeft,
    computedStyle: measureComputedLayoutStyle(node),
    textareaIntrinsicScrollHeight: measureTextareaIntrinsicScrollHeight?.(node),
    svgBoundingBoxWidth: svgBoundingBox?.width,
    svgBoundingBoxHeight: svgBoundingBox?.height,
  };
};
