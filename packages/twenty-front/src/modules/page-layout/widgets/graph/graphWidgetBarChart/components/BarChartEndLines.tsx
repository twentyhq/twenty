import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { calculateBarChartEndLineCoordinates } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateBarChartEndLineCoordinates';
import { type ComputedBarDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type BarChartEndLinesProps = {
  bars: readonly ComputedBarDatum<BarChartDataItem>[];
  enrichedKeys: BarChartEnrichedKey[];
  layout: 'vertical' | 'horizontal';
};

export const BarChartEndLines = ({
  bars,
  enrichedKeys,
  layout,
}: BarChartEndLinesProps) => {
  return (
    <g>
      {bars.map((bar: ComputedBarDatum<BarChartDataItem>, index: number) => {
        const enrichedKey = enrichedKeys.find((k) => k.key === bar.data.id);
        if (!isDefined(enrichedKey)) {
          return null;
        }
        const lineColor = enrichedKey.colorScheme.solid;
        const { x1, y1, x2, y2 } = calculateBarChartEndLineCoordinates(
          bar,
          layout,
        );

        return (
          <line
            key={`${bar.data.id}-${bar.data.indexValue}-endline-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={lineColor}
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
};
