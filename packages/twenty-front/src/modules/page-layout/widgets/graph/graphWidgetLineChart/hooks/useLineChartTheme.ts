import { parseFontSizeToPx } from '@/page-layout/widgets/graph/utils/parseFontSizeToPx';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export const useLineChartTheme = () => {
  const tickFontSize = 12;
  const legendFontSize = parseFontSizeToPx(
    resolveThemeVariable(themeCssVariables.font.size.sm),
    tickFontSize,
  );

  return {
    axis: {
      domain: {
        line: {
          stroke: resolveThemeVariable(themeCssVariables.border.color.light),
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: resolveThemeVariable(themeCssVariables.border.color.light),
          strokeWidth: 1,
        },
        text: {
          fill: resolveThemeVariable(themeCssVariables.font.color.secondary),
          fontSize: tickFontSize,
        },
      },
      legend: {
        text: {
          fill: resolveThemeVariable(themeCssVariables.font.color.primary),
          fontSize: legendFontSize,
          fontWeight: resolveThemeVariable(
            themeCssVariables.font.weight.medium,
          ),
        },
      },
    },
    grid: {
      line: {
        stroke: resolveThemeVariable(themeCssVariables.border.color.light),
        strokeWidth: 1,
        strokeDasharray: '4 4',
      },
    },
    crosshair: {
      line: {
        stroke: resolveThemeVariable(themeCssVariables.font.color.tertiary),
        strokeWidth: 1,
        strokeDasharray: '2 2',
      },
    },
  };
};
