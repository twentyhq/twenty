import { isDefined } from 'twenty-shared/utils';

import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

type RootContainerOrigin = {
  x: number;
  y: number;
};

export const measureNodeGeometry = (
  node: Element,
  rootContainerOrigin: RootContainerOrigin,
  resolveObservedRemoteElementIdForNode: (node: Element) => string | null,
): ElementGeometrySnapshot => {
  const { x, y, width, height } = node.getBoundingClientRect();

  const htmlNode = node instanceof HTMLElement ? node : null;

  const hostOffsetParent = htmlNode?.offsetParent ?? null;
  const offsetParentRemoteElementId = isDefined(hostOffsetParent)
    ? resolveObservedRemoteElementIdForNode(hostOffsetParent)
    : null;

  const shouldReportHostOffsets =
    isDefined(htmlNode) &&
    (isDefined(offsetParentRemoteElementId) || !isDefined(hostOffsetParent));

  return {
    x,
    y,
    width,
    height,
    offsetWidth: htmlNode?.offsetWidth ?? 0,
    offsetHeight: htmlNode?.offsetHeight ?? 0,
    offsetTop: shouldReportHostOffsets
      ? htmlNode.offsetTop
      : y - rootContainerOrigin.y,
    offsetLeft: shouldReportHostOffsets
      ? htmlNode.offsetLeft
      : x - rootContainerOrigin.x,
    clientWidth: node.clientWidth,
    clientHeight: node.clientHeight,
    clientTop: node.clientTop,
    clientLeft: node.clientLeft,
    scrollWidth: node.scrollWidth,
    scrollHeight: node.scrollHeight,
    scrollTop: node.scrollTop,
    scrollLeft: node.scrollLeft,
    offsetParentRemoteElementId,
  };
};
