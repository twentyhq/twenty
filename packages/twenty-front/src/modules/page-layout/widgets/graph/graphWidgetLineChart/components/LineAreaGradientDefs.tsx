import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { createAreaFillDef } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/createAreaFillDef';

type LineAreaGradientDefsProps = {
  enrichedSeries: LineChartEnrichedSeries[];
};

export const LineAreaGradientDefs = ({
  enrichedSeries,
}: LineAreaGradientDefsProps) => {
  return (
    <defs>
      {enrichedSeries.map((seriesItem) => {
        const def = createAreaFillDef(
          seriesItem.colorScheme,
          seriesItem.areaFillId,
        );
        return (
          <linearGradient
            key={def.id}
            id={def.id}
            x1={def.x1}
            y1={def.y1}
            x2={def.x2}
            y2={def.y2}
          >
            {def.colors.map((color, idx) => (
              <stop
                key={idx}
                offset={`${color.offset}%`}
                stopColor={color.color}
                stopOpacity={color.opacity}
              />
            ))}
          </linearGradient>
        );
      })}
    </defs>
  );
};
