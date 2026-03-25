import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { parseFontSizeToPx } from '@/page-layout/widgets/graph/utils/parseFontSizeToPx';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const useBarChartTheme = () => {
  const { theme } = useContext(ThemeContext);

  const tickFontSize = COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE;
  const legendFontSize = parseFontSizeToPx(theme.font.size.sm, tickFontSize);

  return {
    axis: {
      domain: {
        line: {
          stroke: theme.border.color.light,
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: theme.border.color.light,
          strokeWidth: 1,
        },
        text: {
          fill: theme.font.color.secondary,
          fontSize: tickFontSize,
        },
      },
      legend: {
        text: {
          fill: theme.font.color.primary,
          fontSize: legendFontSize,
          fontWeight: theme.font.weight.medium,
        },
      },
    },
    grid: {
      line: {
        stroke: theme.border.color.light,
        strokeWidth: 1,
        strokeDasharray: '4 4',
      },
    },
    labels: {
      text: {
        fontSize: tickFontSize,
        fontWeight: theme.font.weight.medium,
      },
    },
  };
};
