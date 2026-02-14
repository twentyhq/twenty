import { CHART_CORE_CONSTANTS } from '@/page-layout/widgets/graph/chart-core/constants/ChartCoreConstants';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { renderSliceHighlight } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/renderSliceHighlight';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useTheme } from '@emotion/react';
import { useEffect, useState, type RefObject } from 'react';
import { BarChartLayout } from '~/generated-metadata/graphql';

type BarChartHoverLayerEffectProps = {
  hoveredSlice: BarChartSlice | null;
  chartWidth: number;
  chartHeight: number;
  margins: ChartMargins;
  layout: BarChartLayout;
  canvasRef: RefObject<HTMLCanvasElement>;
};

export const BarChartHoverLayerEffect = ({
  hoveredSlice,
  chartWidth,
  chartHeight,
  margins,
  layout,
  canvasRef,
}: BarChartHoverLayerEffectProps) => {
  const theme = useTheme();
  const [dpr] = useState<number>(
    () =>
      (typeof window !== 'undefined' ? window.devicePixelRatio : undefined) ||
      CHART_CORE_CONSTANTS.DEFAULT_DEVICE_PIXEL_RATIO,
  );

  const isVertical = layout === BarChartLayout.VERTICAL;
  const highlightColor = theme.background.transparent.medium;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (chartWidth <= 0 || chartHeight <= 0) {
      return;
    }

    canvas.width = chartWidth * dpr;
    canvas.height = chartHeight * dpr;
    canvas.style.width = `${chartWidth}px`;
    canvas.style.height = `${chartHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, chartWidth, chartHeight);

    if (!hoveredSlice) {
      return;
    }

    ctx.save();
    ctx.translate(margins.left, margins.top);

    const innerWidth = chartWidth - margins.left - margins.right;
    const innerHeight = chartHeight - margins.top - margins.bottom;

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
    chartWidth,
    chartHeight,
    margins.left,
    margins.right,
    margins.top,
    margins.bottom,
    isVertical,
    highlightColor,
    dpr,
    canvasRef,
  ]);

  return null;
};
