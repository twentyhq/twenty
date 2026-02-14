import { BarChartHoverLayerEffect } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartHoverLayerEffect';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import styled from '@emotion/styled';
import { useRef } from 'react';
import { type BarChartLayout } from '~/generated-metadata/graphql';

type BarChartHoverLayerProps = {
  hoveredSlice: BarChartSlice | null;
  chartWidth: number;
  chartHeight: number;
  margins: ChartMargins;
  layout: BarChartLayout;
};

const StyledHoverCanvas = styled.canvas`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
`;

export const BarChartHoverLayer = ({
  hoveredSlice,
  chartWidth,
  chartHeight,
  margins,
  layout,
}: BarChartHoverLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <>
      <StyledHoverCanvas ref={canvasRef} />
      <BarChartHoverLayerEffect
        hoveredSlice={hoveredSlice}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        layout={layout}
        margins={margins}
        canvasRef={canvasRef}
      />
    </>
  );
};
