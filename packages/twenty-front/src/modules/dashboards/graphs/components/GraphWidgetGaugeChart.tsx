import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ResponsiveRadialBar } from '@nivo/radial-bar';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';

import { createGradientDef } from '../utils/createGradientDef';
import { createGraphColorRegistry } from '../utils/createGraphColorRegistry';
import { getColorSchemeByName } from '../utils/getColorSchemeByName';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../utils/graphFormatters';
import { GraphWidgetTooltip } from './GraphWidgetTooltip';

type GraphWidgetGaugeChartProps = {
  value: number;
  min: number;
  max: number;
  showValue?: boolean;
  legendLabel: string;
  tooltipHref?: string;
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

const StyledChartContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
`;

const StyledH1Title = styled(H1Title)`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -150%);
`;

const StyledLegendContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
`;

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledLegendLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledLegendValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDot = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color};
  border-radius: 50%;
  height: 6px;
  width: 6px;
  flex-shrink: 0;
`;

export const GraphWidgetGaugeChart = ({
  value,
  min,
  max,
  showValue = true,
  legendLabel,
  tooltipHref,
  id,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
}: GraphWidgetGaugeChartProps) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const colorRegistry = createGraphColorRegistry(theme);
  const colorScheme =
    getColorSchemeByName(colorRegistry, 'blue') || colorRegistry.blue;

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

  const data = [
    {
      id: 'gauge',
      data: [
        { x: 'value', y: clampedNormalizedValue },
        { x: 'empty', y: 100 - clampedNormalizedValue },
      ],
    },
  ];

  const gradientId = `gaugeGradient-${id}`;
  const gradientDef = createGradientDef(colorScheme, gradientId, isHovered);
  const defs = [gradientDef];

  const handleClick = () => {
    if (isDefined(tooltipHref)) {
      window.location.href = tooltipHref;
    }
  };

  const renderTooltip = () => {
    const percentageValue = normalizedValue.toFixed(1);
    const formattedWithPercentage = `${formattedValue} (${percentageValue}%)`;

    return (
      <GraphWidgetTooltip
        items={[
          {
            label: legendLabel,
            formattedValue: formattedWithPercentage,
            dotColor: colorScheme.solid,
          },
        ]}
        showClickHint={isDefined(tooltipHref)}
      />
    );
  };

  return (
    <StyledContainer
      id={id}
      style={{ cursor: isDefined(tooltipHref) ? 'pointer' : 'default' }}
    >
      <StyledChartContainer>
        <ResponsiveRadialBar
          data={data}
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
          radialAxisStart={null}
          radialAxisEnd={null}
          circularAxisInner={null}
          circularAxisOuter={null}
        />
        {showValue && (
          <StyledH1Title
            title={formattedValue}
            fontColor={H1TitleFontColor.Primary}
          />
        )}
      </StyledChartContainer>
      <StyledLegendContainer>
        <StyledLegendItem>
          <StyledDot $color={colorScheme.solid} />
          <StyledLegendLabel>{legendLabel}</StyledLegendLabel>
          <StyledLegendValue>{formattedValue}</StyledLegendValue>
        </StyledLegendItem>
      </StyledLegendContainer>
    </StyledContainer>
  );
};
