import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { useTheme } from '@emotion/react';
import { type ComputedDatum } from '@nivo/pie';

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
  enrichedData: PieChartEnrichedData[];
};

export const PieChartEndLines = ({
  dataWithArc,
  centerX,
  centerY,
  innerRadius,
  radius,
  enrichedData,
}: PieChartEndLinesProps) => {
  const theme = useTheme();

  if (!dataWithArc || !Array.isArray(dataWithArc) || dataWithArc.length < 2) {
    return null;
  }

  return (
    <g>
      {dataWithArc.map((datum) => {
        const enrichedItem = enrichedData.find((d) => d.id === datum.id);
        const lineColor = enrichedItem
          ? enrichedItem.colorScheme.solid
          : theme.border.color.strong;

        const angle = datum.arc.endAngle - Math.PI / 2;
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;

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
