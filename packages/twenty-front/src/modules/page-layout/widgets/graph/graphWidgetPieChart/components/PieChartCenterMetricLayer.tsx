import { PIE_CHART_CENTER_METRIC_MIN_SIZES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartCenterMetricMinSizes';
import { PIE_CHART_CENTER_METRIC_RATIOS } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartCenterMetricRatios';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import { Trans } from '@lingui/react/macro';
import { type PieCustomLayerProps } from '@nivo/pie';
import { animated, useSpring } from '@react-spring/web';

type PieChartCenterMetricLayerProps = Pick<
  PieCustomLayerProps<PieChartDataItem>,
  'dataWithArc' | 'centerX' | 'centerY' | 'innerRadius'
> & {
  formatOptions: GraphValueFormatOptions;
  showCenterMetric: boolean;
};

export const PieChartCenterMetricLayer = ({
  dataWithArc,
  centerX,
  centerY,
  innerRadius,
  formatOptions,
  showCenterMetric,
}: PieChartCenterMetricLayerProps) => {
  const theme = useTheme();
  const total = dataWithArc.reduce((sum, datum) => sum + datum.value, 0);

  const valueFontSize = Math.max(
    innerRadius * PIE_CHART_CENTER_METRIC_RATIOS.valueFontSize,
    PIE_CHART_CENTER_METRIC_MIN_SIZES.valueFontSize,
  );
  const labelFontSize = Math.max(
    innerRadius * PIE_CHART_CENTER_METRIC_RATIOS.labelFontSize,
    PIE_CHART_CENTER_METRIC_MIN_SIZES.labelFontSize,
  );
  const labelOffset = Math.max(
    innerRadius * PIE_CHART_CENTER_METRIC_RATIOS.labelOffset,
    PIE_CHART_CENTER_METRIC_MIN_SIZES.labelOffset,
  );

  const springProps = useSpring({
    opacity: showCenterMetric ? 1 : 0,
    config: { duration: theme.animation.duration.fast },
    ease: 'easeInOut',
  });

  return (
    <g>
      <animated.text
        x={centerX}
        y={centerY - labelOffset / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          ...springProps,
          fontSize: valueFontSize,
          fontWeight: theme.font.weight.semiBold,
          fill: theme.font.color.primary,
        }}
      >
        {formatGraphValue(total, formatOptions)}
      </animated.text>
      <animated.text
        x={centerX}
        y={centerY + labelOffset}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          ...springProps,
          fontSize: labelFontSize,
          fill: theme.font.color.tertiary,
        }}
      >
        <Trans>Total</Trans>
      </animated.text>
    </g>
  );
};
