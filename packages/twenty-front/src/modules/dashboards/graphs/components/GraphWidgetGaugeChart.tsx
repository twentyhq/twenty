import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  type RadialBarCustomLayerProps,
  ResponsiveRadialBar,
} from '@nivo/radial-bar';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { type GraphColor } from '../types/GraphColor';
import { createGradientDef } from '../utils/createGradientDef';
import { createGraphColorRegistry } from '../utils/createGraphColorRegistry';
import { getColorScheme } from '../utils/getColorScheme';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../utils/graphFormatters';
import { GraphWidgetLegend } from './GraphWidgetLegend';
import { GraphWidgetTooltip } from './GraphWidgetTooltip';

type GaugeChartData = {
  value: number;
  min: number;
  max: number;
  color?: GraphColor;
  to?: string;
  label?: string;
};

type GraphWidgetGaugeChartProps = {
  data: GaugeChartData;
  showValue?: boolean;
  showLegend?: boolean;
  id: string;
} & GraphValueFormatOptions;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledChartContainer = styled.div<{ $isClickable?: boolean }>`
  flex: 1;
  position: relative;
  width: 100%;

  ${({ $isClickable }) =>
    $isClickable &&
    `
    svg g path[fill^="url(#"] {
      cursor: pointer;
    }
  `}
`;

const StyledH1Title = styled(H1Title)`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -150%);
`;

export const GraphWidgetGaugeChart = ({
  data,
  showValue = true,
  showLegend = true,
  id,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
}: GraphWidgetGaugeChartProps) => {
  const { value, min, max, color = 'blue', to, label = 'Value' } = data;
  const theme = useTheme();
  const instanceId = useId();
  const [isHovered, setIsHovered] = useState(false);

  const colorRegistry = createGraphColorRegistry(theme);
  const colorScheme = getColorScheme(colorRegistry, color);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const formattedValue = formatGraphValue(value, formatOptions);

  const normalizedValue = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const clampedNormalizedValue = Math.max(0, Math.min(100, normalizedValue));

  const chartData = [
    {
      id: 'gauge',
      data: [
        { x: 'value', y: clampedNormalizedValue },
        { x: 'empty', y: 100 - clampedNormalizedValue },
      ],
    },
  ];

  const gradientId = `gaugeGradient-${id}-${instanceId}`;
  const gaugeAngle = -90 + (clampedNormalizedValue / 100) * 90;
  const gradientDef = createGradientDef(
    colorScheme,
    gradientId,
    isHovered,
    gaugeAngle,
  );
  const defs = [gradientDef];

  const handleClick = () => {
    if (isDefined(to)) {
      window.location.href = to;
    }
  };

  const renderTooltip = () => {
    const formattedWithPercentage = `${formattedValue} (${normalizedValue.toFixed(1)}%)`;

    return (
      <GraphWidgetTooltip
        items={[
          {
            label: label,
            formattedValue: formattedWithPercentage,
            dotColor: colorScheme.solid,
          },
        ]}
        showClickHint={isDefined(to)}
      />
    );
  };

  const renderValueEndLine = (props: RadialBarCustomLayerProps) => {
    if (clampedNormalizedValue === 0) {
      return null;
    }

    const { center, bars } = props;

    const valueBar = bars?.find((bar) => bar.data.x === 'value');
    if (!valueBar) {
      return null;
    }

    const endAngle = valueBar.arc.endAngle - Math.PI / 2;
    const arcInnerRadius = valueBar.arc.innerRadius;
    const arcOuterRadius = valueBar.arc.outerRadius;

    const [centerX, centerY] = center;
    const x1 = centerX + Math.cos(endAngle) * arcInnerRadius;
    const y1 = centerY + Math.sin(endAngle) * arcInnerRadius;
    const x2 = centerX + Math.cos(endAngle) * arcOuterRadius;
    const y2 = centerY + Math.sin(endAngle) * arcOuterRadius;

    return (
      <g>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={colorScheme.solid}
          strokeWidth={1}
        />
      </g>
    );
  };

  return (
    <StyledContainer>
      <StyledChartContainer $isClickable={isDefined(to)}>
        <ResponsiveRadialBar
          data={chartData}
          startAngle={-90}
          endAngle={90}
          innerRadius={0.7}
          padding={0.2}
          colors={[`url(#${gradientId})`, theme.background.tertiary]}
          defs={defs}
          fill={[
            {
              match: (d: { x: string }) => d.x === 'value',
              id: gradientId,
            },
          ]}
          enableTracks={false}
          enableRadialGrid={false}
          enableCircularGrid={false}
          enableLabels={false}
          isInteractive={true}
          tooltip={renderTooltip}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          layers={['bars', renderValueEndLine]}
        />
        {showValue && (
          <StyledH1Title
            title={formattedValue}
            fontColor={H1TitleFontColor.Primary}
          />
        )}
      </StyledChartContainer>
      <GraphWidgetLegend
        show={showLegend}
        items={[
          {
            id: 'gauge',
            label: label,
            formattedValue: formattedValue,
            color: colorScheme.solid,
          },
        ]}
      />
    </StyledContainer>
  );
};
