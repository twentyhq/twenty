import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { PieChartEndLines } from '@/page-layout/widgets/graph/graphWidgetPieChart/components/PieChartEndLines';
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
  type PieCustomLayerProps,
  type PieTooltipProps,
} from '@nivo/pie';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetPieChartProps = {
  data: PieChartDataItem[];
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

export const GraphWidgetPieChart = ({
  data,
  showLegend = true,
  id,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
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
  } = usePieChartHandlers({ data });

  const { enrichedData, enrichedDataMap, defs, fill } = usePieChartData({
    data,
    colorRegistry,
    id,
    hoveredSliceId,
  });

  const { createTooltipData } = usePieChartTooltip({
    enrichedData,
    data,
    formatOptions,
    displayType,
  });

  const renderSliceEndLines = (
    layerProps: PieCustomLayerProps<PieChartDataItem>,
  ) => (
    <PieChartEndLines
      dataWithArc={layerProps.dataWithArc}
      centerX={layerProps.centerX}
      centerY={layerProps.centerY}
      innerRadius={layerProps.innerRadius}
      radius={layerProps.radius}
      enrichedDataMap={enrichedDataMap}
    />
  );

  const renderTooltip = ({ datum }: PieTooltipProps<PieChartDataItem>) => {
    const tooltipData = createTooltipData(datum);
    if (!isDefined(tooltipData)) return null;

    return (
      <GraphWidgetTooltip
        items={[tooltipData.tooltipItem]}
        showClickHint={tooltipData.showClickHint}
      />
    );
  };

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        $isClickable={hasClickableItems}
        $cursorSelector='svg g path[fill^="url(#"]'
      >
        <ResponsivePie
          data={data}
          innerRadius={0.8}
          colors={enrichedData.map((item) => `url(#${item.gradientId})`)}
          borderWidth={0}
          enableArcLinkLabels={false}
          enableArcLabels={false}
          tooltip={renderTooltip}
          onClick={handleSliceClick}
          onMouseEnter={(datum) => setHoveredSliceId(datum.id)}
          onMouseLeave={() => setHoveredSliceId(null)}
          defs={defs}
          fill={fill}
          layers={['arcs', renderSliceEndLines]}
        />
      </GraphWidgetChartContainer>
      <GraphWidgetLegend
        show={showLegend}
        items={enrichedData.map((item) => ({
          id: item.id,
          label: item.label || item.id,
          color: item.colorScheme.solid,
        }))}
      />
    </StyledContainer>
  );
};
