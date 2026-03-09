import { BarChartBaseLayerEffect } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/BarChartBaseLayerEffect';
import { type BarPosition } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarPosition';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { styled } from '@linaria/react';
import { useRef } from 'react';
import { type BarChartLayout } from '~/generated-metadata/graphql';

type BarChartBaseLayerProps = {
  bars: BarPosition[];
  chartWidth: number;
  chartHeight: number;
  margins: ChartMargins;
  layout: BarChartLayout;
  valueDomain: { min: number; max: number };
  valueTickValues: number[];
  showGrid: boolean;
  highlightedLegendId: string | null;
  allowDataTransitions: boolean;
};

const StyledBaseCanvas = styled.canvas`
  display: block;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
`;

export const BarChartBaseLayer = ({
  bars,
  chartWidth,
  chartHeight,
  margins,
  layout,
  valueDomain,
  valueTickValues,
  showGrid,
  highlightedLegendId,
  allowDataTransitions,
}: BarChartBaseLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <>
      <StyledBaseCanvas ref={canvasRef} />
      <BarChartBaseLayerEffect
        bars={bars}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        layout={layout}
        margins={margins}
        valueDomain={valueDomain}
        valueTickValues={valueTickValues}
        showGrid={showGrid}
        highlightedLegendId={highlightedLegendId}
        allowDataTransitions={allowDataTransitions}
        canvasRef={canvasRef}
      />
    </>
  );
};
