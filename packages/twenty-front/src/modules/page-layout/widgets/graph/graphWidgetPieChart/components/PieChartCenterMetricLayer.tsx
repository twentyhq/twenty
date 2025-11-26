import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import { Trans } from '@lingui/react/macro';
import { type PieCustomLayerProps } from '@nivo/pie';

type PieChartCenterMetricLayerProps = Pick<
  PieCustomLayerProps<PieChartDataItem>,
  'dataWithArc' | 'centerX' | 'centerY' | 'innerRadius'
> & {
  formatOptions: GraphValueFormatOptions;
};

export const PieChartCenterMetricLayer = ({
  dataWithArc,
  centerX,
  centerY,
  innerRadius,
  formatOptions,
}: PieChartCenterMetricLayerProps) => {
  const theme = useTheme();
  const total = dataWithArc.reduce((sum, datum) => sum + datum.value, 0);

  const valueFontSize = Math.max(innerRadius * 0.25, 12);
  const labelFontSize = Math.max(innerRadius * 0.12, 10);
  const labelOffset = Math.max(innerRadius * 0.15, 12);

  return (
    <g>
      <text
        x={centerX}
        y={centerY - labelOffset / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: valueFontSize,
          fontWeight: theme.font.weight.semiBold,
          fill: theme.font.color.primary,
        }}
      >
        {formatGraphValue(total, formatOptions)}
      </text>
      <text
        x={centerX}
        y={centerY + labelOffset}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: labelFontSize,
          fill: theme.font.color.tertiary,
        }}
      >
        <Trans>Total</Trans>
      </text>
    </g>
  );
};
