import { themeCssVariables } from 'twenty-ui/theme-constants';

// Nivo `theme` prop built from Twenty's CSS variables so axes, grid lines, labels,
// and tooltips track the CRM's light/dark scheme automatically (the var() strings
// re-resolve when Twenty swaps the root `.light`/`.dark` class). Shared by the
// trend line chart and the channel-split pie chart.
export const propelNivoTheme = {
  background: 'transparent',
  text: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    fill: themeCssVariables.font.color.tertiary,
  },
  axis: {
    domain: { line: { stroke: themeCssVariables.border.color.light } },
    ticks: {
      line: { stroke: themeCssVariables.border.color.light, strokeWidth: 1 },
      text: { fill: themeCssVariables.font.color.tertiary, fontSize: 10 },
    },
    legend: {
      text: { fill: themeCssVariables.font.color.secondary, fontSize: 11 },
    },
  },
  grid: {
    line: { stroke: themeCssVariables.border.color.light, strokeWidth: 1 },
  },
  legends: {
    text: { fill: themeCssVariables.font.color.secondary, fontSize: 11 },
  },
  tooltip: {
    container: {
      background: themeCssVariables.background.secondary,
      color: themeCssVariables.font.color.primary,
      fontSize: 12,
      borderRadius: 6,
      border: `1px solid ${themeCssVariables.border.color.medium}`,
    },
  },
};

// A stable, on-brand categorical palette for series/slices. Twenty's primary is
// red, so the lead color is red; the rest are picked from the design tokens to
// read clearly in both schemes.
export const PROPEL_CHART_COLORS: string[] = [
  themeCssVariables.color.red,
  themeCssVariables.color.blue,
  themeCssVariables.color.green,
  themeCssVariables.color.orange,
  themeCssVariables.color.purple,
  themeCssVariables.color.turquoise,
];

// Per-channel fixed colors so EMAIL / WHATSAPP read the same everywhere.
export const channelColor = (channel: 'EMAIL' | 'WHATSAPP'): string =>
  channel === 'WHATSAPP'
    ? themeCssVariables.color.green
    : themeCssVariables.color.blue;
