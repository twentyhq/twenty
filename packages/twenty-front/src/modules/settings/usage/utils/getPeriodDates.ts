import { type PeriodPreset } from '@/settings/usage/utils/periodPreset';

const PERIOD_DAYS: Record<PeriodPreset, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

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
