import { t } from '@lingui/core/macro';

export type PeriodPreset = '7d' | '30d' | '90d';

const PERIOD_DAYS: Record<PeriodPreset, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export const getOperationTypeLabel = (key: string): string => {
  switch (key) {
    case 'AI_TOKEN':
      return t`AI Chat`;
    case 'WORKFLOW_EXECUTION':
      return t`Workflow Execution`;
    case 'CODE_EXECUTION':
      return t`Code Execution`;
    default:
      return key;
  }
};

export const getPeriodOptions = (): {
  value: PeriodPreset;
  label: string;
}[] => [
  { value: '7d', label: t`Last 7 days` },
  { value: '30d', label: t`Last 30 days` },
  { value: '90d', label: t`Last 90 days` },
];

export const getPeriodDates = (
  preset: PeriodPreset,
): { periodStart: string; periodEnd: string } => {
  const now = new Date();
  const start = new Date(now);

  start.setDate(start.getDate() - PERIOD_DAYS[preset]);

  return {
    periodStart: start.toISOString(),
    periodEnd: now.toISOString(),
  };
};

export const CHART_COLORS_KEYS = [
  'blue',
  'purple',
  'turquoise',
  'orange',
  'pink',
  'green',
] as const;

export const getChartColors = (theme: {
  color: Record<(typeof CHART_COLORS_KEYS)[number], string>;
}): string[] => CHART_COLORS_KEYS.map((key) => theme.color[key]);
