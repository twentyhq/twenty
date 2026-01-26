import { CHART_CORE_CONSTANTS } from '@/page-layout/widgets/graph/chart-core/constants/ChartCoreConstants';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { renderSliceHighlight } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/renderSliceHighlight';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChartLayout } from '~/generated/graphql';

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
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dpr, setDpr] = useState<number>(
    CHART_CORE_CONSTANTS.DEFAULT_DEVICE_PIXEL_RATIO,
  );

  const isVertical = layout === BarChartLayout.VERTICAL;
  const highlightColor = theme.background.transparent.medium;

  const canvasSize = useMemo(
    () => ({ width: chartWidth, height: chartHeight }),
    [chartWidth, chartHeight],
  );

  useEffect(() => {
    setDpr(
      window.devicePixelRatio ||
        CHART_CORE_CONSTANTS.DEFAULT_DEVICE_PIXEL_RATIO,
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (canvasSize.width <= 0 || canvasSize.height <= 0) {
      return;
    }

    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    if (!hoveredSlice) {
      return;
    }

    ctx.save();
    ctx.translate(margins.left, margins.top);

    const innerWidth = canvasSize.width - margins.left - margins.right;
    const innerHeight = canvasSize.height - margins.top - margins.bottom;

    renderSliceHighlight({
      ctx,
      slice: hoveredSlice,
      innerWidth,
      innerHeight,
      isVertical,
      highlightColor,
    });

    ctx.restore();
  }, [
    hoveredSlice,
    canvasSize,
    margins.left,
    margins.right,
    margins.top,
    margins.bottom,
    isVertical,
    highlightColor,
    dpr,
  ]);

  return <StyledHoverCanvas ref={canvasRef} />;
};
