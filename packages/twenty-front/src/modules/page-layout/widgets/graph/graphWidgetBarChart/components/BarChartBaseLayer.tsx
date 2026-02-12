import { BarChartBaseLayerEffect } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartBaseLayerEffect';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import styled from '@emotion/styled';
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
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
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
