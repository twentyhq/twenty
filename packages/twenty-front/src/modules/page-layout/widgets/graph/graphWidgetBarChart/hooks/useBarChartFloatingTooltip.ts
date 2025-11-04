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

const TOOLTIP_HIDE_DELAY_MS = 300;
const TOOLTIP_OFFSET_PX = 2;
const TOOLTIP_BOUNDARY_PADDING_PX = 8;

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

  const { refs, floatingStyles } = useFloating({
    placement: 'left',
    strategy: 'fixed',
    middleware: [
      offset(TOOLTIP_OFFSET_PX),
      flip({
        fallbackPlacements: ['right', 'top', 'bottom'],
        boundary: document.querySelector('#root') ?? undefined,
      }),
      shift({
        boundary: document.querySelector('#root') ?? undefined,
        padding: TOOLTIP_BOUNDARY_PADDING_PX,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const debouncedClearTooltip = useDebouncedCallback(() => {
    setHoveredBarDatum(null);
  }, TOOLTIP_HIDE_DELAY_MS);

  const showTooltipForBar = useCallback(
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

  const scheduleTooltipHide = useCallback(() => {
    debouncedClearTooltip();
  }, [debouncedClearTooltip]);

  const cancelTooltipHide = useCallback(() => {
    debouncedClearTooltip.cancel();
  }, [debouncedClearTooltip]);

  const hideTooltip = useCallback(() => {
    setHoveredBarDatum(null);
  }, []);

  return {
    refs,
    floatingStyles,
    hoveredBarDatum,
    showTooltipForBar,
    scheduleTooltipHide,
    cancelTooltipHide,
    hideTooltip,
  };
};
