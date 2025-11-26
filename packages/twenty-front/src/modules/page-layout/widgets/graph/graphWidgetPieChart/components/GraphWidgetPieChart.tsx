import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { PIE_CHART_HOVER_BRIGHTNESS } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartHoverBrightness';
import { PIE_CHART_MARGINS } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMargins';
import { usePieChartData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/usePieChartData';
import { usePieChartHandlers } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/usePieChartHandlers';
import { usePieChartTooltip } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/usePieChartTooltip';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ResponsivePie,
  type ComputedDatum,
  type PieTooltipProps,
} from '@nivo/pie';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetPieChartProps = {
  data: PieChartDataItem[];
  showLegend?: boolean;
  id: string;
  onSliceClick?: (datum: PieChartDataItem) => void;
  showDataLabels?: boolean;
} & GraphValueFormatOptions;

const emptyStateData: PieChartDataItem[] = [
  { id: 'empty', label: '', value: 1 },
];

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledPieChartWrapper = styled.div<{ preventHover: boolean }>`
  width: 100%;
  height: 100%;

  svg g path {
    transition: filter 0.15s ease-in-out;

    &:hover {
      filter: ${({ preventHover }) =>
        preventHover ? 'none' : `brightness(${PIE_CHART_HOVER_BRIGHTNESS})`};
    }
  }
`;

export const GraphWidgetPieChart = ({
  data,
  showLegend = true,
  id,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
  onSliceClick,
  showDataLabels = false,
}: GraphWidgetPieChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const {
    hoveredSliceId,
    setHoveredSliceId,
    handleSliceClick,
    hasClickableItems,
  } = usePieChartHandlers({ data, onSliceClick });

  const { enrichedData } = usePieChartData({
    data,
    colorRegistry,
    hoveredSliceId,
  });

  const { createTooltipData } = usePieChartTooltip({
    enrichedData,
    formatOptions,
    displayType,
  });

  const renderTooltip = ({ datum }: PieTooltipProps<PieChartDataItem>) => {
    const tooltipData = createTooltipData(datum);
    if (!isDefined(tooltipData)) return null;

    return (
      <GraphWidgetTooltip
        items={[tooltipData.tooltipItem]}
        onGraphWidgetTooltipClick={() => handleSliceClick(datum)}
      />
    );
  };

  const hasNoData = useMemo(
    () => data.length === 0 || data.every((item) => item.value === 0),
    [data],
  );

  const chartData = hasNoData ? emptyStateData : data;
  const chartColors = hasNoData
    ? [theme.background.tertiary]
    : enrichedData.map((item) => item.colorScheme.solid);

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        $isClickable={!hasNoData && hasClickableItems}
        $cursorSelector="svg g path"
      >
        <StyledPieChartWrapper preventHover={hasNoData}>
          <ResponsivePie
            data={chartData}
            margin={showDataLabels && !hasNoData ? PIE_CHART_MARGINS : {}}
            innerRadius={0.8}
            padAngle={hasNoData ? 0 : 1}
            colors={chartColors}
            borderWidth={0}
            enableArcLinkLabels={showDataLabels && !hasNoData}
            enableArcLabels={false}
            tooltip={hasNoData ? () => null : renderTooltip}
            onClick={hasNoData ? undefined : handleSliceClick}
            onMouseEnter={
              hasNoData ? undefined : (datum) => setHoveredSliceId(datum.id)
            }
            onMouseLeave={hasNoData ? undefined : () => setHoveredSliceId(null)}
            layers={['arcs', 'arcLinkLabels']}
            arcLinkLabel={(datum: ComputedDatum<PieChartDataItem>) => {
              const tooltipData = createTooltipData(datum);
              return (
                tooltipData?.tooltipItem.formattedValue ||
                datum.data.value.toString()
              );
            }}
            arcLinkLabelsDiagonalLength={10}
            arcLinkLabelsStraightLength={10}
            arcLinkLabelsTextColor={theme.font.color.light}
            arcLinkLabelsColor={theme.font.color.extraLight}
          />
        </StyledPieChartWrapper>
      </GraphWidgetChartContainer>
      <GraphWidgetLegend
        show={showLegend && !hasNoData}
        items={enrichedData.map((item) => ({
          id: item.id,
          label: item.label || item.id,
          color: item.colorScheme.solid,
        }))}
      />
    </StyledContainer>
  );
};
