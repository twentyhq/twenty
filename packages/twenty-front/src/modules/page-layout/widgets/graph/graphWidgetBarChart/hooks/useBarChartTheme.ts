import { useTheme } from '@emotion/react';

export const useBarChartTheme = () => {
  const theme = useTheme();

  return {
    axis: {
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
          fill: theme.font.color.secondary,
          fontSize: 12,
          fontWeight: theme.font.weight.regular,
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
