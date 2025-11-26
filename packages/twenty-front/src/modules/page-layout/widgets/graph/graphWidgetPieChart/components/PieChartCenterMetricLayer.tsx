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
  'dataWithArc' | 'centerX' | 'centerY'
> & {
  formatOptions: GraphValueFormatOptions;
};

export const PieChartCenterMetricLayer = ({
  dataWithArc,
  centerX,
  centerY,
  formatOptions,
}: PieChartCenterMetricLayerProps) => {
  const theme = useTheme();
  const total = dataWithArc.reduce((sum, datum) => sum + datum.value, 0);

  return (
    <g>
      <text
        x={centerX}
        y={centerY - 8}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: theme.font.size.xxl,
          fontWeight: theme.font.weight.semiBold,
          fill: theme.font.color.primary,
        }}
      >
        {formatGraphValue(total, formatOptions)}
      </text>
      <text
        x={centerX}
        y={centerY + 12}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: theme.font.size.sm,
          fill: theme.font.color.tertiary,
        }}
      >
        <Trans>Total</Trans>
      </text>
    </g>
  );
};
