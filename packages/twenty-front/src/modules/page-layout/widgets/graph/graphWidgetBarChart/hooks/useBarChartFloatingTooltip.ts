import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type VirtualElement,
} from '@floating-ui/react';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

export type BarDatumWithGeometry = ComputedDatum<BarDatum> & {
  barElement?: SVGElement;
  barAbsoluteX?: number;
  barAbsoluteY?: number;
  barWidth?: number;
  barHeight?: number;
};

const createFloatingAnchorFromBarGeometry = (
  datum: BarDatumWithGeometry,
): VirtualElement | null => {
  if (
    !isDefined(datum.barElement) ||
    !isDefined(datum.barAbsoluteX) ||
    !isDefined(datum.barAbsoluteY) ||
    !isDefined(datum.barWidth)
  ) {
    return null;
  }

  return {
    getBoundingClientRect: () => {
      const barElementRectangle = datum.barElement!.getBoundingClientRect();
      const svgContainerRectangle = datum
        .barElement!.closest('svg')
        ?.getBoundingClientRect();

      if (!svgContainerRectangle) {
        return barElementRectangle;
      }

      return {
        left: svgContainerRectangle.left + datum.barAbsoluteX!,
        right:
          svgContainerRectangle.left + datum.barAbsoluteX! + datum.barWidth!,
        top: svgContainerRectangle.top + datum.barAbsoluteY!,
        bottom: svgContainerRectangle.top + datum.barAbsoluteY! + 1,
        width: datum.barWidth!,
        height: 1,
        x: svgContainerRectangle.left + datum.barAbsoluteX!,
        y: svgContainerRectangle.top + datum.barAbsoluteY!,
      };
    },
  };
};

export const useBarChartFloatingTooltip = () => {
  const [hoveredBarDatum, setHoveredBarDatum] =
    useState<BarDatumWithGeometry | null>(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);

  const { refs, floatingStyles } = useFloating({
    placement: 'left',
    strategy: 'fixed',
    middleware: [
      offset(2),
      flip({
        fallbackPlacements: ['right', 'top', 'bottom'],
        boundary: document.querySelector('#root') ?? undefined,
      }),
      shift({
        boundary: document.querySelector('#root') ?? undefined,
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const debouncedClearTooltip = useDebouncedCallback(() => {
    if (!isTooltipHovered) {
      setHoveredBarDatum(null);
    }
  }, 100);

  const handleBarMouseEnter = useCallback(
    (datum: BarDatumWithGeometry) => {
      debouncedClearTooltip.cancel();
      setHoveredBarDatum(datum);

      const virtualElement = createFloatingAnchorFromBarGeometry(datum);
      if (isDefined(virtualElement)) {
        refs.setReference(virtualElement);
      }
    },
    [debouncedClearTooltip, refs],
  );

  const handleBarMouseLeave = useCallback(() => {
    debouncedClearTooltip();
  }, [debouncedClearTooltip]);

  const handleTooltipMouseEnter = useCallback(() => {
    debouncedClearTooltip.cancel();
    setIsTooltipHovered(true);
  }, [debouncedClearTooltip]);

  const handleTooltipMouseLeave = useCallback(() => {
    setIsTooltipHovered(false);
    setHoveredBarDatum(null);
  }, []);

  const isTooltipVisible = isDefined(hoveredBarDatum);

  return {
    refs,
    floatingStyles,
    hoveredBarDatum,
    isTooltipVisible,
    handleBarMouseEnter,
    handleBarMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
  };
};
