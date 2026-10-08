import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const updateFrontComponentPortalLayer = ({
  portalLayer,
  viewport,
}: {
  portalLayer: HTMLElement;
  viewport: ViewportGeometrySnapshot;
}): void => {
  portalLayer.style.left = `calc(${viewport.rootContainerX}px / var(--t-zoom, 1))`;
  portalLayer.style.top = `calc(${viewport.rootContainerY}px / var(--t-zoom, 1))`;
  portalLayer.style.width = `calc(${viewport.rootContainerWidth}px / var(--t-zoom, 1))`;
  portalLayer.style.height = `calc(${viewport.rootContainerHeight}px / var(--t-zoom, 1))`;
};
