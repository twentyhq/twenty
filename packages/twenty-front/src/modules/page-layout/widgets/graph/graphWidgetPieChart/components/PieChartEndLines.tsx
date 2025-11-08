import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { calculatePieChartEndLineCoordinates } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/calculatePieChartEndLineCoordinates';
import { useTheme } from '@emotion/react';
import { type ComputedDatum } from '@nivo/pie';
import { isDefined } from 'twenty-shared/utils';

type PieChartEndLinesProps = {
  dataWithArc: readonly ComputedDatum<{
    id: string;
    value: number;
    label?: string;
  }>[];
  centerX: number;
  centerY: number;
  innerRadius: number;
  radius: number;
  enrichedDataMap: Map<string, PieChartEnrichedData>;
};

export const PieChartEndLines = ({
  dataWithArc,
  centerX,
  centerY,
  innerRadius,
  radius,
  enrichedDataMap,
}: PieChartEndLinesProps) => {
  const theme = useTheme();

  if (
    !isDefined(dataWithArc) ||
    !Array.isArray(dataWithArc) ||
    dataWithArc.length < 2
  ) {
    return null;
  }

  return (
    <g>
      {dataWithArc.map((datum) => {
        const enrichedItem = enrichedDataMap.get(datum.id);
        const lineColor = enrichedItem
          ? enrichedItem.colorScheme.solid
          : theme.border.color.strong;

        const { x1, y1, x2, y2 } = calculatePieChartEndLineCoordinates(
          datum.arc.endAngle,
          centerX,
          centerY,
          innerRadius,
          radius,
        );

        return (
          <line
            key={`${datum.id}-separator`}
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
