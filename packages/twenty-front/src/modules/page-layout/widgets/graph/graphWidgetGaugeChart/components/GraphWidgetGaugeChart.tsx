import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { GaugeChartEndLine } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/components/GaugeChartEndLine';
import { useGaugeChartData } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/hooks/useGaugeChartData';
import { useGaugeChartHandlers } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/hooks/useGaugeChartHandlers';
import { useGaugeChartTooltip } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/hooks/useGaugeChartTooltip';
import { type GaugeChartData } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/types/GaugeChartData';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  type RadialBarCustomLayerProps,
  ResponsiveRadialBar,
} from '@nivo/radial-bar';
import { useId } from 'react';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';

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
  const theme = useTheme();
  const instanceId = useId();
  const colorRegistry = createGraphColorRegistry(theme);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const { isHovered, setIsHovered, handleClick, hasClickableItems } =
    useGaugeChartHandlers({ data });

  const {
    colorScheme,
    normalizedValue,
    clampedNormalizedValue,
    chartData,
    gradientId,
    defs,
  } = useGaugeChartData({
    data,
    colorRegistry,
    id,
    instanceId,
    isHovered,
  });

  const { createTooltipData } = useGaugeChartTooltip({
    value: data.value,
    normalizedValue,
    label: data.label || t`Value`,
    colorScheme,
    formatOptions,
    to: data.to,
  });

  const formattedValue = formatGraphValue(data.value, formatOptions);

  const renderValueEndLine = (props: RadialBarCustomLayerProps) => (
    <GaugeChartEndLine
      center={props.center}
      bars={props.bars}
      clampedNormalizedValue={clampedNormalizedValue}
      colorScheme={colorScheme}
    />
  );

  const renderTooltip = () => {
    const tooltipData = createTooltipData();
    return (
      <GraphWidgetTooltip
        items={[tooltipData.tooltipItem]}
        showClickHint={tooltipData.showClickHint}
      />
    );
  };

  return (
    <StyledContainer>
      <StyledChartContainer $isClickable={hasClickableItems}>
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
            label: data.label || t`Value`,
            color: colorScheme.solid,
          },
        ]}
      />
    </StyledContainer>
  );
};
