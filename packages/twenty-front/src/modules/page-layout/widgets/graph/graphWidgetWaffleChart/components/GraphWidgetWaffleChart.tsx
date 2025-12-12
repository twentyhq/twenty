import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { WaffleChartCenterMetric } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/components/WaffleChartCenterMetricLayer';
import { WAFFLE_CHART_HOVER_BRIGHTNESS } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/constants/WaffleChartHoverBrightness';
import { WAFFLE_CHART_MARGINS } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/constants/WaffleChartMargins';
import { useWaffleChartData } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/hooks/useWaffleChartData';
import { useWaffleChartTooltip } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/hooks/useWaffleChartTooltip';
import { type WaffleChartDataItem } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/types/WaffleChartDataItem';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ResponsiveWaffle,
  type ComputedDatum,
  type TooltipProps,
} from '@nivo/waffle';
import { useCallback, useMemo, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WaffleChartConfiguration } from '~/generated/graphql';

type GraphWidgetWaffleChartProps = {
  data: WaffleChartDataItem[];
  showValue?: boolean;
  showLegend?: boolean;
  id: string;
  objectMetadataItemId: string;
  configuration: WaffleChartConfiguration;
  onSliceClick?: (datum: WaffleChartDataItem) => void;
  showDataLabels?: boolean;
} & GraphValueFormatOptions;

const emptyStateData: WaffleChartDataItem[] = [{ id: 'empty', value: 1, label: 'empty' }];

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledWaffleChartWrapper = styled.div<{ preventHover: boolean }>`
  container-type: size;
  height: 100%;
  position: relative;
  width: 100%;

  svg g path {
    transition: filter 0.15s ease-in-out;

    &:hover {
      filter: ${({ preventHover }) =>
        preventHover ? 'none' : `brightness(${WAFFLE_CHART_HOVER_BRIGHTNESS})`};
    }
  }
`;

export const GraphWidgetWaffleChart = ({
  data,
  showLegend = true,
  id,
  objectMetadataItemId,
  configuration,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
  onSliceClick,
  showDataLabels = false,
}: GraphWidgetWaffleChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);
  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const { enrichedData } = useWaffleChartData({
    data,
    colorRegistry,
  });

  const { createTooltipData } = useWaffleChartTooltip({
    enrichedData,
    formatOptions,
    displayType,
  });

  const handleSliceClick = (datum: ComputedDatum<WaffleChartDataItem>) => {
    if (isDefined(onSliceClick)) {
      onSliceClick(datum.data);
    }
  };

  const renderTooltip = ({ data }: TooltipProps<WaffleChartDataItem>) => {
	const tooltipData = createTooltipData(data);
	if (!isDefined(tooltipData)) return null;
	
    const handleTooltipClick: (() => void) | undefined = isDefined(onSliceClick)
      ? () => handleSliceClick(data)
      : undefined;

    return (
      <GraphWidgetTooltip
        items={[tooltipData.tooltipItem]}
        onGraphWidgetTooltipClick={handleTooltipClick}
      />
    );
  };

  const hasNoData = useMemo(
    () => data.length === 0 || data.every((item) => item.value === 0),
    [data],
  );
  const chartData = hasNoData ? emptyStateData : data;
  const total = enrichedData.reduce((sum, item) => sum + item.value, 0);
  const chartColors = hasNoData
    ? [theme.background.tertiary]
    : enrichedData.map((item) => item.colorScheme.solid);
  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        $isClickable={!hasNoData && isDefined(onSliceClick)}
        $cursorSelector="svg g path"
      >
        <StyledWaffleChartWrapper preventHover={hasNoData}>
          <ResponsiveWaffle
            data={enrichedData}
			total={total}
			rows={10}
			columns={10}
            margin={showDataLabels && !hasNoData ? WAFFLE_CHART_MARGINS : {}}
            colors={chartColors}
            borderWidth={0}
			isInteractive={true}
            tooltip={hasNoData ? () => null : renderTooltip}
            onClick={hasNoData ? undefined : (datum) => handleSliceClick(datum)}
            layers={['cells', 'legends']}
            theme={{
              labels: {
                text: {
                  fontSize: theme.font.size.sm,
                  fontWeight: theme.font.weight.medium,
                },
              },
            }}
          />
        </StyledWaffleChartWrapper>
      </GraphWidgetChartContainer>
      <GraphWidgetLegend
        show={showLegend && !hasNoData}
        items={enrichedData.map((item) => ({
          id: item.id,
          label: item.id,
          color: item.colorScheme.solid,
        }))}
      />
    </StyledContainer>
  );
};
