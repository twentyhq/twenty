import { parseFontSizeToPx } from '@/page-layout/widgets/graph/utils/parseFontSizeToPx';
import { useTheme } from '@emotion/react';

export const useLineChartTheme = () => {
  const theme = useTheme();
  const tickFontSize = 12;
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
    crosshair: {
      line: {
        stroke: theme.font.color.tertiary,
        strokeWidth: 1,
        strokeDasharray: '2 2',
      },
    },
  };
};
