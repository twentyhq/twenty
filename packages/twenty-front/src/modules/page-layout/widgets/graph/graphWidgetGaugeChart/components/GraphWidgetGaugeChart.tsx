import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { GaugeChartEndLine } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/components/GaugeChartEndLine';
import { useGaugeChartData } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/hooks/useGaugeChartData';
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
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';

type GraphWidgetGaugeChartProps = {
  data: GaugeChartData;
  showValue?: boolean;
  showLegend?: boolean;
  id: string;
  onGaugeClick?: (data: GaugeChartData) => void;
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
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
  onGaugeClick,
}: GraphWidgetGaugeChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };
  const handleClick = () => {
    onGaugeClick?.(data);
  };

  const hasClickableItems = isDefined(onGaugeClick);

  const { colorScheme, normalizedValue, clampedNormalizedValue, chartData } =
    useGaugeChartData({
      data,
      colorRegistry,
    });

  const { createTooltipData } = useGaugeChartTooltip({
    value: data.value,
    normalizedValue,
    label: data.label || t`Value`,
    colorScheme,
    formatOptions,
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
    return <GraphWidgetTooltip items={[tooltipData.tooltipItem]} />;
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
          enableTracks={false}
          enableRadialGrid={false}
          enableCircularGrid={false}
          enableLabels={false}
          isInteractive={true}
          tooltip={renderTooltip}
          onClick={hasClickableItems ? handleClick : undefined}
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
