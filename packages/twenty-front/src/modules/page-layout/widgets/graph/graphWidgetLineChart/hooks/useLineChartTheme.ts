import { useTheme } from '@emotion/react';

export const useLineChartTheme = () => {
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
          fontSize: 12,
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
    crosshair: {
      line: {
        stroke: theme.font.color.tertiary,
        strokeWidth: 1,
        strokeDasharray: '2 2',
      },
    },
  };
};
