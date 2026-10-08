import { isRootContainerInteractive } from '@/host/geometry/utils/isRootContainerInteractive';
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
  portalLayer.style.display = isRootContainerInteractive(rootContainer)
    ? ''
    : 'none';
  portalLayer.style.left = `calc(${viewport.rootContainerX}px / var(--t-zoom, 1))`;
  portalLayer.style.top = `calc(${viewport.rootContainerY}px / var(--t-zoom, 1))`;
  portalLayer.style.width = `calc(${viewport.rootContainerWidth}px / var(--t-zoom, 1))`;
  portalLayer.style.height = `calc(${viewport.rootContainerHeight}px / var(--t-zoom, 1))`;
};
