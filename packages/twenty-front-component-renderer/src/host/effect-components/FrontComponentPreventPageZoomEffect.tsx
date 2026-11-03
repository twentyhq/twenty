import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isPageZoomGesture } from 'twenty-ui/utilities';

import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';

type FrontComponentPreventPageZoomEffectProps = {
  geometryTracker: Pick<GeometryTracker, 'findRemoteElementIdContainingNode'>;
};

export const FrontComponentPreventPageZoomEffect = ({
  geometryTracker,
}: FrontComponentPreventPageZoomEffectProps) => {
  useEffect(() => {
    const preventPageZoom = (event: WheelEvent) => {
      if (
        !isPageZoomGesture(event) ||
        !isDefined(
          geometryTracker.findRemoteElementIdContainingNode(event.target),
        )
      ) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener('wheel', preventPageZoom, {
      capture: true,
      passive: false,
    });

    return () => {
      document.removeEventListener('wheel', preventPageZoom, true);
    };
  }, [geometryTracker]);

  return null;
};
