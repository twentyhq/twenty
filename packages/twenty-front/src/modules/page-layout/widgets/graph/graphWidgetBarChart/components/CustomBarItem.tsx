import { BAR_CHART_HOVER_BRIGHTNESS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartHoverBrightness';
import { type BarDatum, type BarItemProps } from '@nivo/bar';
import { Text } from '@nivo/text';
import { useTheme } from '@nivo/theming';
import { useTooltip } from '@nivo/tooltip';
import { animated, to } from '@react-spring/web';
import { isNumber } from '@sniptt/guards';
import { createElement, useCallback, useMemo, type MouseEvent } from 'react';
import styled from 'styled-components';
import { isDefined } from 'twenty-shared/utils';

type CustomBarItemProps<D extends BarDatum> = BarItemProps<D> & {
  keys?: string[];
  groupMode?: 'grouped' | 'stacked';
  data?: readonly D[];
  indexBy?: string;
  layout?: 'vertical' | 'horizontal';
  chartId?: string;
};

const StyledBarRect = styled(animated.rect)<{ $isInteractive?: boolean }>`
  cursor: ${({ $isInteractive }) => ($isInteractive ? 'pointer' : 'default')};
  transition: filter 0.15s ease-in-out;

  &:hover {
    filter: ${({ $isInteractive }) =>
      $isInteractive ? `brightness(${BAR_CHART_HOVER_BRIGHTNESS})` : 'none'};
  }
`;

// This is a copy of the BarItem component from @nivo/bar with some design modifications
export const CustomBarItem = <D extends BarDatum>({
  bar: { data: barData, ...bar },
  style: {
    borderColor,
    color,
    height,
    labelColor,
    labelOpacity,
    labelX,
    labelY,
    transform,
    width,
    textAnchor,
  },
  borderRadius,
  borderWidth,
  label,
  shouldRenderLabel,
  isInteractive,
  onClick,
  onMouseEnter,
  onMouseLeave,
  tooltip,
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
  layout = 'vertical',
  chartId,
}: CustomBarItemProps<D>) => {
  const theme = useTheme();
  const { showTooltipFromEvent, showTooltipAt, hideTooltip } = useTooltip();

  const renderTooltip = useMemo(
    () => () => createElement(tooltip, { ...bar, ...barData }),
    [tooltip, bar, barData],
  );

  const handleClick = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      onClick?.({ color: bar.color, ...barData }, event);
    },
    [bar, barData, onClick],
  );
  const handleTooltip = useCallback(
    (event: MouseEvent<SVGRectElement>) =>
      showTooltipFromEvent(renderTooltip(), event),
    [showTooltipFromEvent, renderTooltip],
  );
  const handleMouseEnter = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      onMouseEnter?.(barData, event);
      showTooltipFromEvent(renderTooltip(), event);
    },
    [barData, onMouseEnter, showTooltipFromEvent, renderTooltip],
  );
  const handleMouseLeave = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      onMouseLeave?.(barData, event);
      hideTooltip();
    },
    [barData, hideTooltip, onMouseLeave],
  );

  const handleFocus = useCallback(() => {
    showTooltipAt(renderTooltip(), [bar.absX + bar.width / 2, bar.absY]);
  }, [showTooltipAt, renderTooltip, bar]);

  const handleBlur = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  const isNegativeValue = useMemo(
    () => isNumber(barData.value) && barData.value < 0,
    [barData.value],
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
      (data) => data[indexBy] === barData.indexValue,
    );

    if (!isDefined(dataPoint)) {
      return true;
    }

    const currentKeyIndex = keys.findIndex((key) => key === barData.id);

    if (currentKeyIndex === -1) {
      return true;
    }

    const keysAfterCurrentKey = keys.slice(currentKeyIndex + 1);
    const hasSameSignBarAfter = keysAfterCurrentKey.some((key) => {
      const value = dataPoint[key];
      return isNumber(value) && (isNegativeValue ? value < 0 : value > 0);
    });
    return !hasSameSignBarAfter;
  }, [groupMode, keys, barData, chartData, indexBy, isNegativeValue]);

  const isHorizontal = layout === 'horizontal';

  const clipPathId = `round-corner-${chartId ?? 'chart'}-${barData.index}-${String(
    barData.id,
  )}`;

  const clipPathX = !isHorizontal ? 0 : isNegativeValue ? 0 : -borderRadius;

  const clipPathY = isHorizontal ? 0 : isNegativeValue ? -borderRadius : 0;

  const widthWithOffset = (v: number) =>
    Math.max(v + (isHorizontal ? borderRadius : 0), 0);
  const heightWithOffset = (v: number) =>
    Math.max(v + (isHorizontal ? 0 : borderRadius), 0);
  const clampRadius = (v: number) => Math.min(borderRadius, v / 2);

  const clipRectWidth = to(width, (v) => widthWithOffset(v));
  const clipRectHeight = to(height, (v) => heightWithOffset(v));
  const clipRx = to(width, (v) => clampRadius(widthWithOffset(v)));
  const clipRy = to(height, (v) => clampRadius(heightWithOffset(v)));

  return (
    <animated.g transform={transform}>
      {shouldRoundFreeEnd && (
        <defs>
          <clipPath id={clipPathId}>
            <animated.rect
              x={clipPathX}
              y={clipPathY}
              rx={clipRx}
              ry={clipRy}
              width={clipRectWidth}
              height={clipRectHeight}
            />
          </clipPath>
        </defs>
      )}

      <StyledBarRect
        $isInteractive={isInteractive}
        clipPath={shouldRoundFreeEnd ? `url(#${clipPathId})` : undefined}
        width={to(width, (value) => Math.max(value, 0))}
        height={to(height, (value) => Math.max(value, 0))}
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
        onMouseMove={isInteractive ? handleTooltip : undefined}
        onMouseLeave={isInteractive ? handleMouseLeave : undefined}
        onClick={isInteractive ? handleClick : undefined}
        onFocus={isInteractive && isFocusable ? handleFocus : undefined}
        onBlur={isInteractive && isFocusable ? handleBlur : undefined}
        data-testid={`bar.item.${barData.id}.${barData.index}`}
      />

      {shouldRenderLabel && (
        <Text
          x={labelX}
          y={labelY}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fillOpacity={labelOpacity}
          style={{
            ...theme.labels.text,
            // We don't want the label to intercept mouse events
            pointerEvents: 'none',
            fill: labelColor,
          }}
        >
          {label}
        </Text>
      )}
    </animated.g>
  );
};
