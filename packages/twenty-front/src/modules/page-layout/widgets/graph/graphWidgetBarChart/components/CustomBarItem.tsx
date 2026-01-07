import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type BarDatum, type BarItemProps } from '@nivo/bar';
import { animated, to } from '@react-spring/web';
import { isNumber } from '@sniptt/guards';
import { useCallback, useMemo, type MouseEvent } from 'react';
import styled from 'styled-components';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type CustomBarItemProps<D extends BarDatum> = BarItemProps<D> & {
  keys?: string[];
  groupMode?: 'grouped' | 'stacked';
  data?: readonly D[];
  indexBy?: string;
  layout?: BarChartLayout;
  chartId?: string;
};

const StyledBarRect = styled(animated.rect)<{
  $isInteractive?: boolean;
  $isDimmed?: boolean;
}>`
  cursor: ${({ $isInteractive }) => ($isInteractive ? 'pointer' : 'default')};
  transition:
    filter 0.15s ease-in-out,
    opacity 0.15s ease-in-out;
  opacity: ${({ $isDimmed }) =>
    $isDimmed ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1};

  &:hover {
    filter: ${({ $isInteractive }) =>
      $isInteractive
        ? `brightness(${BAR_CHART_CONSTANTS.HOVER_BRIGHTNESS})`
        : 'none'};
  }
`;

// This is a copy of the BarItem component from @nivo/bar with some design modifications
export const CustomBarItem = <D extends BarDatum>({
  bar: { data: barData, ...bar },
  style: { borderColor, color, height, transform, width },
  borderRadius,
  borderWidth,
  isInteractive,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isFocusable,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  ariaDisabled,
  ariaHidden,
  keys,
  groupMode = 'grouped',
  data: chartData,
  indexBy,
  layout = BarChartLayout.VERTICAL,
  chartId,
}: CustomBarItemProps<D>) => {
  const highlightedLegendId = useRecoilComponentValue(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const isDimmed =
    isDefined(highlightedLegendId) &&
    String(highlightedLegendId) !== String(barData.id);

  const handleClick = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      onClick?.({ color: bar.color, ...barData }, event);
    },
    [bar, barData, onClick],
  );

  const handleMouseEnter = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      onMouseEnter?.(barData, event);
    },
    [barData, onMouseEnter],
  );

  const handleMouseLeave = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      onMouseLeave?.(barData, event);
    },
    [barData, onMouseLeave],
  );

  const isNegativeValue = useMemo(
    () => isNumber(barData.value) && barData.value < 0,
    [barData.value],
  );

  const seriesIndex = useMemo(
    () =>
      isDefined(keys)
        ? keys.findIndex((currentKey) => currentKey === barData.id)
        : -1,
    [keys, barData.id],
  );

  const shouldRoundFreeEnd = useMemo(() => {
    const isStackedAndValid =
      groupMode === 'stacked' &&
      isDefined(keys) &&
      keys.length > 0 &&
      isDefined(chartData) &&
      isDefined(indexBy);

    if (!isStackedAndValid) {
      return true;
    }

    const dataPoint = chartData.find(
      (chartDataItem) => chartDataItem[indexBy] === barData.indexValue,
    );

    if (!isDefined(dataPoint)) {
      return true;
    }

    if (seriesIndex === -1) {
      return true;
    }

    const keysAfterCurrentKey = keys.slice(seriesIndex + 1);
    const hasSameSignBarAfter = keysAfterCurrentKey.some((key) => {
      const value = dataPoint[key];
      return isNumber(value) && (isNegativeValue ? value < 0 : value > 0);
    });
    return !hasSameSignBarAfter;
  }, [
    groupMode,
    keys,
    chartData,
    indexBy,
    isNegativeValue,
    seriesIndex,
    barData.indexValue,
  ]);

  const isHorizontal = layout === BarChartLayout.HORIZONTAL;
  const clipPathId = `round-corner-${chartId ?? 'chart'}-${barData.index}-${
    seriesIndex >= 0 ? seriesIndex : 'x'
  }`;

  const unconstrainedThicknessDimension = isHorizontal ? height : width;
  const unconstrainedValueDimension = isHorizontal ? width : height;

  const constrainedThicknessDimension = to(
    unconstrainedThicknessDimension,
    (dimension) => Math.min(dimension, BAR_CHART_CONSTANTS.MAXIMUM_WIDTH),
  );

  const centeringOffset = to(unconstrainedThicknessDimension, (dimension) =>
    dimension > BAR_CHART_CONSTANTS.MAXIMUM_WIDTH
      ? (dimension - BAR_CHART_CONSTANTS.MAXIMUM_WIDTH) / 2
      : 0,
  );

  const centeringTransform = to(centeringOffset, (offset) =>
    isHorizontal ? `translate(0, ${offset})` : `translate(${offset}, 0)`,
  );

  const finalBarWidthDimension = isHorizontal
    ? unconstrainedValueDimension
    : constrainedThicknessDimension;

  const finalBarHeightDimension = isHorizontal
    ? constrainedThicknessDimension
    : unconstrainedValueDimension;

  const clipPathX = !isHorizontal ? 0 : isNegativeValue ? 0 : -borderRadius;
  const clipPathY = isHorizontal ? 0 : isNegativeValue ? -borderRadius : 0;

  const widthWithOffset = (value: number) =>
    Math.max(value + (isHorizontal ? borderRadius : 0), 0);
  const heightWithOffset = (value: number) =>
    Math.max(value + (isHorizontal ? 0 : borderRadius), 0);
  const clampRadius = (value: number) => Math.min(borderRadius, value / 2);

  const clipRectWidth = to(finalBarWidthDimension, (value) =>
    widthWithOffset(value),
  );
  const clipRectHeight = to(finalBarHeightDimension, (value) =>
    heightWithOffset(value),
  );
  const clipBorderRadiusX = to(finalBarWidthDimension, (value) =>
    clampRadius(widthWithOffset(value)),
  );
  const clipBorderRadiusY = to(finalBarHeightDimension, (value) =>
    clampRadius(heightWithOffset(value)),
  );

  return (
    <animated.g transform={transform}>
      <animated.g transform={centeringTransform}>
        {shouldRoundFreeEnd && (
          <defs>
            <clipPath id={clipPathId}>
              <animated.rect
                x={clipPathX}
                y={clipPathY}
                rx={clipBorderRadiusX}
                ry={clipBorderRadiusY}
                width={clipRectWidth}
                height={clipRectHeight}
              />
            </clipPath>
          </defs>
        )}

        <StyledBarRect
          $isInteractive={isInteractive}
          $isDimmed={isDimmed}
          clipPath={shouldRoundFreeEnd ? `url(#${clipPathId})` : undefined}
          width={to(finalBarWidthDimension, (value) => Math.max(value, 0))}
          height={to(finalBarHeightDimension, (value) => Math.max(value, 0))}
          fill={color}
          strokeWidth={borderWidth}
          stroke={borderColor}
          focusable={isFocusable}
          tabIndex={isFocusable ? 0 : undefined}
          aria-label={ariaLabel ? ariaLabel(barData) : undefined}
          aria-labelledby={ariaLabelledBy ? ariaLabelledBy(barData) : undefined}
          aria-describedby={
            ariaDescribedBy ? ariaDescribedBy(barData) : undefined
          }
          aria-disabled={ariaDisabled ? ariaDisabled(barData) : undefined}
          aria-hidden={ariaHidden ? ariaHidden(barData) : undefined}
          onMouseEnter={isInteractive ? handleMouseEnter : undefined}
          onMouseLeave={isInteractive ? handleMouseLeave : undefined}
          onClick={isInteractive ? handleClick : undefined}
          data-testid={`bar.item.${barData.id}.${barData.index}`}
        />
      </animated.g>
    </animated.g>
  );
};
