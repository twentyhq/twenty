import { type RefObject, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
      if (event.ctrlKey || event.metaKey) {
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
