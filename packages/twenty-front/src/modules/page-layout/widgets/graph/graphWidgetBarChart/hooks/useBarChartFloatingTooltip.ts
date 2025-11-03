import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

type UseBarChartFloatingTooltipProps = {
  setHoveredBar: (
    value: {
      key: string;
      indexValue: string | number;
    } | null,
  ) => void;
};

export const useBarChartFloatingTooltip = ({
  setHoveredBar,
}: UseBarChartFloatingTooltipProps) => {
  const [hoveredDatum, setHoveredDatum] =
    useState<ComputedDatum<BarDatum> | null>(null);
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
    if (!value && !isTooltipHovered) {
      setHoveredBar(null);
    }
  }, 100);

  const handleBarMouseEnter = useCallback(
    (datum: any) => {
      setIsChartHovered(true);
      debouncedSetChartHovered.cancel();

      setHoveredDatum(datum);

      if (isDefined(datum.id) && isDefined(datum.indexValue)) {
        setHoveredBar({
          key: String(datum.id),
          indexValue: datum.indexValue,
        });
      }

      if (
        isDefined(datum.barElement) &&
        isDefined(datum.barAbsX) &&
        isDefined(datum.barAbsY) &&
        isDefined(datum.barWidth)
      ) {
        const virtualElement = {
          getBoundingClientRect: () => {
            const rect = datum.barElement.getBoundingClientRect();
            const containerRect = datum.barElement
              .closest('svg')
              ?.getBoundingClientRect();

            if (!containerRect) {
              return rect;
            }

            return {
              left: containerRect.left + datum.barAbsX,
              right: containerRect.left + datum.barAbsX + datum.barWidth,
              top: containerRect.top + datum.barAbsY,
              bottom: containerRect.top + datum.barAbsY + 1,
              width: datum.barWidth,
              height: 1,
              x: containerRect.left + datum.barAbsX,
              y: containerRect.top + datum.barAbsY,
            } as DOMRect;
          },
        };
        refs.setReference(virtualElement);
      }
    },
    [debouncedSetChartHovered, setHoveredBar, refs],
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
    if (!isChartHovered) {
      setHoveredBar(null);
    }
  }, [isChartHovered, setHoveredBar]);

  const isTooltipVisible =
    hoveredDatum !== null && (isChartHovered || isTooltipHovered);

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
