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

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - PERIOD_DAYS[preset]);
  start.setHours(0, 0, 0, 0);

  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
};
