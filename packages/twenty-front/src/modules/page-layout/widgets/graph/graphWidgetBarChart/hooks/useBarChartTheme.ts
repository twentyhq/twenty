import { useTheme } from '@emotion/react';

export const useBarChartTheme = () => {
  const theme = useTheme();

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
          fontSize: 11,
        },
      },
      legend: {
        text: {
          fill: theme.font.color.primary,
          fontSize: theme.font.size.sm,
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
        fontSize: 11,
        fontWeight: theme.font.weight.medium,
      },
    },
  };
};
