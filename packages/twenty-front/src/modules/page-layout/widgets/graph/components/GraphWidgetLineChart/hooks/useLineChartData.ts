import { type LineSeries } from '@nivo/line';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type ThemeType } from 'twenty-ui/theme';
import { type GraphColorRegistry } from '../../../types/GraphColorRegistry';
import { createGradientDef } from '../../../utils/createGradientDef';
import { getColorScheme } from '../../../utils/getColorScheme';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../../../utils/graphFormatters';
import { type LineChartEnrichedSeries } from '../types/LineChartEnrichedSeries';
import { type LineChartSeries } from '../types/LineChartSeries';

type UseLineChartDataProps = {
  data: LineChartSeries[];
  colorRegistry: GraphColorRegistry;
  id: string;
  instanceId: string;
  enableArea: boolean;
  theme: ThemeType;
  formatOptions: GraphValueFormatOptions;
};

export const useLineChartData = ({
  data,
  colorRegistry,
  id,
  instanceId,
  enableArea,
  theme,
  formatOptions,
}: UseLineChartDataProps) => {
  const dataMap: Record<string, LineChartSeries> = {};
  for (const series of data) {
    dataMap[series.id] = series;
  }

  const enrichedSeries = useMemo((): LineChartEnrichedSeries[] => {
    return data.map((series, index) => {
      const colorScheme = getColorScheme(colorRegistry, series.color, index);
      const shouldEnableArea = series.enableArea ?? enableArea;
      const gradientId = `lineGradient-${id}-${instanceId}-${series.id}-${index}`;

      return {
        ...series,
        colorScheme,
        gradientId,
        shouldEnableArea,
        label: series.label || series.id,
      };
    });
  }, [data, colorRegistry, id, instanceId, enableArea]);

  const nivoData: LineSeries[] = data.map((series) => ({
    id: series.id,
    data: series.data.map((point) => ({
      x: point.x,
      y: point.y,
    })),
  }));

  const defs = enrichedSeries
    .filter((series) => series.shouldEnableArea)
    .map((series) =>
      createGradientDef(
        series.colorScheme,
        series.gradientId,
        false,
        90,
        theme.name === 'light',
      ),
    );

  const fill = enrichedSeries
    .filter((series) => series.shouldEnableArea)
    .map((series) => ({
      match: { id: series.id },
      id: series.gradientId,
    }));

  const colors = enrichedSeries.map((series) => series.colorScheme.solid);

  const legendItems = enrichedSeries.map((series) => {
    const total = series.data.reduce((sum, point) => sum + (point.y || 0), 0);
    return {
      id: series.id,
      label: series.label,
      formattedValue: formatGraphValue(total, formatOptions),
      color: series.colorScheme.solid,
    };
  });

  const hasClickableItems = data.some((series) =>
    series.data.some((point) => isDefined(point.to)),
  );

  return {
    dataMap,
    enrichedSeries,
    nivoData,
    defs,
    fill,
    colors,
    legendItems,
    hasClickableItems,
  };
};
