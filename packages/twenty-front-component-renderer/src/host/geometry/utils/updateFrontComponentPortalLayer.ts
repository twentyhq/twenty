import { isDefined } from 'twenty-shared/utils';

import { isFrontComponentPortalOwnerInert } from '@/host/geometry/utils/isFrontComponentPortalOwnerInert';
import { toZoomCompensatedCssLength } from '@/host/geometry/utils/toZoomCompensatedCssLength';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

const setStylePropertyIfChanged = (
  element: HTMLElement,
  propertyName: string,
  value: string,
): void => {
  if (element.style.getPropertyValue(propertyName) === value) {
    return;
  }

  element.style.setProperty(propertyName, value);
};

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

  setStylePropertyIfChanged(
    portalLayer,
    'display',
    hasVisibleRoot ? 'block' : 'none',
  );

  if (!hasVisibleRoot) {
    return;
  }

  setStylePropertyIfChanged(
    portalLayer,
    'left',
    toZoomCompensatedCssLength(viewport.rootContainerX),
  );
  setStylePropertyIfChanged(
    portalLayer,
    'top',
    toZoomCompensatedCssLength(viewport.rootContainerY),
  );
  setStylePropertyIfChanged(
    portalLayer,
    'width',
    toZoomCompensatedCssLength(viewport.rootContainerWidth),
  );
  setStylePropertyIfChanged(
    portalLayer,
    'height',
    toZoomCompensatedCssLength(viewport.rootContainerHeight),
  );

  const isOwnerInert = isFrontComponentPortalOwnerInert(rootContainer);

  if (portalLayer.inert !== isOwnerInert) {
    portalLayer.inert = isOwnerInert;
  }
};
