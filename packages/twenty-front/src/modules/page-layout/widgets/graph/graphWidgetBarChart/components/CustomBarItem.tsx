import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { graphWidgetIsSliceHoveredComponentFamilySelector } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetIsSliceHoveredComponentFamilySelector';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type BarDatum, type BarItemProps } from '@nivo/bar';
import { animated, to } from '@react-spring/web';
import { isNumber } from '@sniptt/guards';
import { useMemo } from 'react';
import styled from 'styled-components';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type CustomBarItemProps<D extends BarDatum> = BarItemProps<D> & {
  shouldRoundFreeEnd: boolean;
  seriesIndex: number;
  layout?: BarChartLayout;
  chartId?: string;
};

const StyledBarRect = styled(animated.rect)<{
  $isInteractive?: boolean;
  $isDimmed?: boolean;
  $isSliceHovered?: boolean;
}>`
  cursor: ${({ $isInteractive }) => ($isInteractive ? 'pointer' : 'default')};
  filter: ${({ $isSliceHovered, $isInteractive }) =>
    $isSliceHovered && $isInteractive
      ? `brightness(${BAR_CHART_CONSTANTS.HOVER_BRIGHTNESS})`
      : 'none'};
  opacity: ${({ $isDimmed }) =>
    $isDimmed ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1};
  pointer-events: none;
  transition:
    filter 0.15s ease-in-out,
    opacity 0.15s ease-in-out;
`;

// This is a copy of the BarItem component from @nivo/bar with some design modifications
export const CustomBarItem = <D extends BarDatum>({
  bar: { data: barData },
  style: { borderColor, color, height, transform, width },
  borderRadius,
  borderWidth,
  isInteractive,
  isFocusable,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  ariaDisabled,
  ariaHidden,
  shouldRoundFreeEnd,
  seriesIndex,
  layout = BarChartLayout.VERTICAL,
  chartId,
}: CustomBarItemProps<D>) => {
  const highlightedLegendId = useRecoilComponentValue(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const isSliceHovered = useRecoilComponentFamilyValue(
    graphWidgetIsSliceHoveredComponentFamilySelector,
    String(barData.indexValue),
  );

  const isDimmed =
    isDefined(highlightedLegendId) &&
    String(highlightedLegendId) !== String(barData.id);

  const isNegativeValue = isNumber(barData.value) && barData.value < 0;

  const isHorizontal = layout === BarChartLayout.HORIZONTAL;
  const clipPathId = `round-corner-${chartId ?? 'chart'}-${barData.index}-${
    seriesIndex >= 0 ? seriesIndex : 'x'
  }`;

  const clipPathX = !isHorizontal || isNegativeValue ? 0 : -borderRadius;
  const clipPathY = isHorizontal || !isNegativeValue ? 0 : -borderRadius;

  const barInterpolations = useMemo(() => {
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

    const clampToZero = (value: number) => Math.max(value, 0);

    return {
      centeringTransform,
      finalBarWidth: to(finalBarWidthDimension, clampToZero),
      finalBarHeight: to(finalBarHeightDimension, clampToZero),
      finalBarWidthDimension,
      finalBarHeightDimension,
    };
  }, [width, height, isHorizontal]);

  const clipInterpolations = useMemo(() => {
    if (!shouldRoundFreeEnd) {
      return null;
    }

    const { finalBarWidthDimension, finalBarHeightDimension } =
      barInterpolations;

    const widthWithOffset = (value: number) =>
      Math.max(value + (isHorizontal ? borderRadius : 0), 0);
    const heightWithOffset = (value: number) =>
      Math.max(value + (isHorizontal ? 0 : borderRadius), 0);
    const clampRadius = (value: number) => Math.min(borderRadius, value / 2);

    return {
      clipRectWidth: to(finalBarWidthDimension, widthWithOffset),
      clipRectHeight: to(finalBarHeightDimension, heightWithOffset),
      clipBorderRadiusX: to(finalBarWidthDimension, (value) =>
        clampRadius(widthWithOffset(value)),
      ),
      clipBorderRadiusY: to(finalBarHeightDimension, (value) =>
        clampRadius(heightWithOffset(value)),
      ),
    };
  }, [barInterpolations, shouldRoundFreeEnd, isHorizontal, borderRadius]);

  return (
    <animated.g transform={transform}>
      <animated.g transform={barInterpolations.centeringTransform}>
        {clipInterpolations && (
          <defs>
            <clipPath id={clipPathId}>
              <animated.rect
                x={clipPathX}
                y={clipPathY}
                rx={clipInterpolations.clipBorderRadiusX}
                ry={clipInterpolations.clipBorderRadiusY}
                width={clipInterpolations.clipRectWidth}
                height={clipInterpolations.clipRectHeight}
              />
            </clipPath>
          </defs>
        )}

        <StyledBarRect
          $isInteractive={isInteractive}
          $isDimmed={isDimmed}
          $isSliceHovered={isSliceHovered}
          clipPath={clipInterpolations ? `url(#${clipPathId})` : undefined}
          width={barInterpolations.finalBarWidth}
          height={barInterpolations.finalBarHeight}
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
          data-testid={`bar.item.${barData.id}.${barData.index}`}
        />
      </animated.g>
    </animated.g>
  );
};
