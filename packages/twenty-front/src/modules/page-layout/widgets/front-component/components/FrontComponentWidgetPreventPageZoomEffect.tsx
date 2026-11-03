import { type RefObject, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isPageZoomGesture } from 'twenty-ui/utilities';

type FrontComponentWidgetPreventPageZoomEffectProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

export const FrontComponentWidgetPreventPageZoomEffect = ({
  containerRef,
}: FrontComponentWidgetPreventPageZoomEffectProps) => {
  useEffect(() => {
    const container = containerRef.current;

    if (!isDefined(container)) {
      return;
    }

    const preventPageZoom = (event: WheelEvent) => {
      if (isPageZoomGesture(event)) {
        event.preventDefault();
      }
    };

    container.addEventListener('wheel', preventPageZoom, {
      capture: true,
      passive: false,
    });

    return () => {
      container.removeEventListener('wheel', preventPageZoom, true);
    };
  }, [containerRef]);

  return null;
};
