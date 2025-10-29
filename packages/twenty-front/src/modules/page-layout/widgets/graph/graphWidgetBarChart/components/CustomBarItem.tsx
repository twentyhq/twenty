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

  const isTopBar = useMemo(() => {
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

    const keysAboveCurrentKey = keys.slice(currentKeyIndex + 1);
    const hasBarAbove = keysAboveCurrentKey.some((key) => {
      const value = dataPoint[key];
      return isNumber(value) && value > 0;
    });

    return !hasBarAbove;
  }, [groupMode, keys, barData, chartData, indexBy]);

  const isHorizontal = layout === 'horizontal';

  return (
    <animated.g transform={transform}>
      {isTopBar && (
        <defs>
          <clipPath id={`round-corner-${barData.index}`}>
            <animated.rect
              x={isHorizontal ? -borderRadius : 0}
              y={0}
              rx={borderRadius}
              ry={borderRadius}
              width={to(width, (value) =>
                Math.max(value + (isHorizontal ? borderRadius : 0), 0),
              )}
              height={to(height, (value) =>
                Math.max(value + (isHorizontal ? 0 : borderRadius), 0),
              )}
            />
          </clipPath>
        </defs>
      )}

      <StyledBarRect
        $isInteractive={isInteractive}
        clipPath={isTopBar ? `url(#round-corner-${barData.index})` : undefined}
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
