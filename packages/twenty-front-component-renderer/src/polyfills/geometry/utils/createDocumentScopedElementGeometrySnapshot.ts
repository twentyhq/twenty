import { EMPTY_ELEMENT_GEOMETRY_SNAPSHOT } from '@/polyfills/geometry/constants/EmptyElementGeometrySnapshot';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const createDocumentScopedElementGeometrySnapshot = ({
  viewport,
  isDocumentElement,
}: {
  viewport: ViewportGeometrySnapshot;
  isDocumentElement: boolean;
}): ElementGeometrySnapshot => ({
  ...EMPTY_ELEMENT_GEOMETRY_SNAPSHOT,
  computedStyle: viewport.computedStyle,
  x: viewport.rootContainerX,
  y: viewport.rootContainerY,
  width: viewport.rootContainerWidth,
  height: viewport.rootContainerHeight,
  offsetWidth: viewport.rootContainerWidth,
  offsetHeight: viewport.rootContainerHeight,
  clientWidth: viewport.rootContainerClientWidth,
  clientHeight: viewport.rootContainerClientHeight,
  scrollWidth: viewport.rootContainerClientWidth,
  scrollHeight: viewport.rootContainerClientHeight,
  scrollTop: isDocumentElement ? viewport.scrollY : 0,
  scrollLeft: isDocumentElement ? viewport.scrollX : 0,
});
