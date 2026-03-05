import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { parseFontSizeToPx } from '@/page-layout/widgets/graph/utils/parseFontSizeToPx';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export const useBarChartTheme = () => {
  const tickFontSize = COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE;
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
    labels: {
      text: {
        fontSize: tickFontSize,
        fontWeight: resolveThemeVariable(themeCssVariables.font.weight.medium),
      },
    },
  };
};
