import { isDefined } from 'twenty-shared/utils';

import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const updateFrontComponentPortalLayer = ({
  portalLayer,
  rootContainer,
  viewport,
}: {
  portalLayer: HTMLElement;
  rootContainer: Element | null;
  viewport: ViewportGeometrySnapshot;
}): void => {
  const hasVisibleRoot =
    isDefined(rootContainer) &&
    rootContainer.isConnected &&
    viewport.rootContainerWidth > 0 &&
    viewport.rootContainerHeight > 0;
  portalLayer.style.display = hasVisibleRoot ? 'block' : 'none';

  if (!hasVisibleRoot || !isDefined(rootContainer)) {
    return;
  }

  portalLayer.style.left = `calc(${viewport.rootContainerX}px / var(--t-zoom, 1))`;
  portalLayer.style.top = `calc(${viewport.rootContainerY}px / var(--t-zoom, 1))`;
  portalLayer.style.width = `calc(${viewport.rootContainerWidth}px / var(--t-zoom, 1))`;
  portalLayer.style.height = `calc(${viewport.rootContainerHeight}px / var(--t-zoom, 1))`;
  portalLayer.inert =
    getComputedStyle(rootContainer).pointerEvents === 'none' ||
    isDefined(rootContainer.closest('[inert]'));
};
