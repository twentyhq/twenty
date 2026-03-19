import { DATA_RESIDENCY_CONFIG } from '@/settings/admin-panel/ai/constants/DataResidencyConfig';

export const getDataResidencyDisplay = (residency: string): string => {
  const entry = DATA_RESIDENCY_CONFIG[residency];

  return entry
    ? `${entry.flag} ${entry.label}`
    : `🌐 ${residency.toUpperCase()}`;
};
