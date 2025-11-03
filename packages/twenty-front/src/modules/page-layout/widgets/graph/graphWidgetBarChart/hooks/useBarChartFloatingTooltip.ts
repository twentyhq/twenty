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

// find a better name
export type EnrichedBarDatum = ComputedDatum<BarDatum> & {
  barElement?: SVGElement;
  barAbsX?: number;
  barAbsY?: number;
  barWidth?: number;
  barHeight?: number;
};

const createBarVirtualElement = (
  datum: EnrichedBarDatum,
): VirtualElement | null => {
  if (
    !isDefined(datum.barElement) ||
    !isDefined(datum.barAbsX) ||
    !isDefined(datum.barAbsY) ||
    !isDefined(datum.barWidth)
  ) {
    return null;
  }

  return {
    getBoundingClientRect: () => {
      const rect = datum.barElement!.getBoundingClientRect();
      const containerRect = datum
        .barElement!.closest('svg')
        ?.getBoundingClientRect();

      if (!containerRect) {
        return rect;
      }

      return {
        left: containerRect.left + datum.barAbsX!,
        right: containerRect.left + datum.barAbsX! + datum.barWidth!,
        top: containerRect.top + datum.barAbsY!,
        bottom: containerRect.top + datum.barAbsY! + 1,
        width: datum.barWidth!,
        height: 1,
        x: containerRect.left + datum.barAbsX!,
        y: containerRect.top + datum.barAbsY!,
      };
    },
  };
};

export const useBarChartFloatingTooltip = () => {
  const [hoveredDatum, setHoveredDatum] = useState<EnrichedBarDatum | null>(
    null,
  );
  const [isChartHovered, setIsChartHovered] = useState(false);
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

  const debouncedSetChartHovered = useDebouncedCallback((value: boolean) => {
    setIsChartHovered(value);
  }, 100);

  const handleBarMouseEnter = useCallback(
    (datum: EnrichedBarDatum) => {
      setIsChartHovered(true);
      debouncedSetChartHovered.cancel();

      setHoveredDatum(datum);

      const virtualElement = createBarVirtualElement(datum);
      if (isDefined(virtualElement)) {
        refs.setReference(virtualElement);
      }
    },
    [debouncedSetChartHovered, refs],
  );

  const handleBarMouseLeave = useCallback(() => {
    debouncedSetChartHovered(false);
  }, [debouncedSetChartHovered]);

  const handleTooltipMouseEnter = useCallback(() => {
    debouncedSetChartHovered.cancel();
    setIsTooltipHovered(true);
  }, [debouncedSetChartHovered]);

  const handleTooltipMouseLeave = useCallback(() => {
    setIsTooltipHovered(false);
    setHoveredDatum(null);
  }, []);

  const isTooltipVisible =
    isDefined(hoveredDatum) && (isChartHovered || isTooltipHovered);

  return {
    refs,
    floatingStyles,
    hoveredDatum,
    isTooltipVisible,
    handleBarMouseEnter,
    handleBarMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
  };
};
