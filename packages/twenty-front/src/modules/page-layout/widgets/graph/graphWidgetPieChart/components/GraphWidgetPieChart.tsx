import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { CustomArcsLayer } from '@/page-layout/widgets/graph/graphWidgetPieChart/components/CustomArcsLayer';
import { GraphPieChartTooltip } from '@/page-layout/widgets/graph/graphWidgetPieChart/components/GraphPieChartTooltip';
import { PieChartCenterMetric } from '@/page-layout/widgets/graph/graphWidgetPieChart/components/PieChartCenterMetricLayer';
import { PIE_CHART_HOVER_BRIGHTNESS } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartHoverBrightness';
import { PIE_CHART_MARGINS } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMargins';
import { usePieChartData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/usePieChartData';
import { graphWidgetPieTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetPieChart/states/graphWidgetPieTooltipComponentState';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { getPieChartFormattedValue } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/getPieChartFormattedValue';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ResponsivePie,
  type ComputedDatum,
  type PieCustomLayerProps,
} from '@nivo/pie';
import {
  useCallback,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';

type GraphWidgetPieChartProps = {
  data: PieChartDataItem[];
  showLegend?: boolean;
  id: string;
  objectMetadataItemId: string;
  configuration: PieChartConfiguration;
  onSliceClick?: (datum: PieChartDataItem) => void;
  showDataLabels?: boolean;
  showCenterMetric?: boolean;
} & GraphValueFormatOptions;

const emptyStateData: PieChartDataItem[] = [{ id: 'empty', value: 1 }];

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledPieChartWrapper = styled.div<{ preventHover: boolean }>`
  container-type: size;
  height: 100%;
  position: relative;
  width: 100%;

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
  objectMetadataItemId,
  configuration,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
  onSliceClick,
  showDataLabels = false,
  showCenterMetric = true,
}: GraphWidgetPieChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);
  const containerRef = useRef<HTMLDivElement>(null);
  const setActivePieTooltip = useSetRecoilComponentState(
    graphWidgetPieTooltipComponentState,
  );

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const { enrichedData, legendItems } = usePieChartData({
    data,
    colorRegistry,
  });

  const handleSliceMove = useCallback(
    (
      datum: ComputedDatum<PieChartDataItem>,
      event: ReactMouseEvent<SVGPathElement>,
    ) => {
      if (!isDefined(containerRef.current)) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      setActivePieTooltip({
        datum,
        offsetLeft: event.clientX - containerRect.left,
        offsetTop: event.clientY - containerRect.top,
      });
    },
    [setActivePieTooltip],
  );

  const handleSliceLeave = useCallback(() => {
    setActivePieTooltip(null);
  }, [setActivePieTooltip]);

  const hasNoData = useMemo(
    () =>
      enrichedData.length === 0 ||
      enrichedData.every((item) => item.value === 0),
    [enrichedData],
  );

  const chartData = hasNoData ? emptyStateData : enrichedData;
  const chartColors = hasNoData
    ? [theme.background.tertiary]
    : enrichedData.map((item) => item.colorScheme.solid);

  const ArcsLayer = useCallback(
    (props: PieCustomLayerProps<PieChartDataItem>) => (
      <CustomArcsLayer
        dataWithArc={props.dataWithArc}
        arcGenerator={props.arcGenerator}
        centerX={props.centerX}
        centerY={props.centerY}
        onMouseMove={hasNoData ? undefined : handleSliceMove}
        onMouseLeave={hasNoData ? undefined : handleSliceLeave}
        onClick={
          hasNoData
            ? undefined
            : (datum) => {
                if (isDefined(onSliceClick)) {
                  onSliceClick(datum.data);
                }
              }
        }
      />
    ),
    [hasNoData, handleSliceMove, handleSliceLeave, onSliceClick],
  );

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        ref={containerRef}
        $isClickable={!hasNoData && isDefined(onSliceClick)}
        $cursorSelector="svg g path"
        onMouseLeave={handleSliceLeave}
      >
        <StyledPieChartWrapper preventHover={hasNoData}>
          <ResponsivePie
            data={chartData}
            margin={showDataLabels && !hasNoData ? PIE_CHART_MARGINS : {}}
            innerRadius={0.8}
            padAngle={hasNoData ? 0 : 0.4}
            colors={chartColors}
            enableArcLinkLabels={showDataLabels && !hasNoData}
            enableArcLabels={false}
            tooltip={() => null}
            layers={[ArcsLayer, 'arcLinkLabels']}
            arcLinkLabel={(datum: ComputedDatum<PieChartDataItem>) => {
              const formattedValue = getPieChartFormattedValue({
                datum,
                enrichedData,
                formatOptions,
                displayType,
              });
              return formattedValue ?? datum.data.value.toString();
            }}
            arcLinkLabelsDiagonalLength={10}
            arcLinkLabelsStraightLength={10}
            arcLinkLabelsTextColor={theme.font.color.light}
            arcLinkLabelsColor={theme.font.color.extraLight}
            theme={{
              labels: {
                text: {
                  fontSize: theme.font.size.sm,
                  fontWeight: theme.font.weight.medium,
                },
              },
            }}
          />
          <PieChartCenterMetric
            objectMetadataItemId={objectMetadataItemId}
            configuration={configuration}
            show={showCenterMetric && !hasNoData}
            hasNoData={hasNoData}
          />
        </StyledPieChartWrapper>
      </GraphWidgetChartContainer>
      <GraphPieChartTooltip
        containerRef={containerRef}
        enrichedData={enrichedData}
        formatOptions={formatOptions}
        displayType={displayType}
        onSliceClick={onSliceClick}
      />
      <GraphWidgetLegend
        show={showLegend && data.length > 0}
        items={legendItems}
      />
    </StyledContainer>
  );
};
