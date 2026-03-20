import {
  DATA_RESIDENCY_CONFIG,
  type DataResidencyKey,
} from '@/settings/admin-panel/ai/constants/DataResidencyConfig';

const isDataResidencyKey = (key: string): key is DataResidencyKey =>
  key in DATA_RESIDENCY_CONFIG;

export const getDataResidencyDisplay = (residency: string): string => {
  if (isDataResidencyKey(residency)) {
    const entry = DATA_RESIDENCY_CONFIG[residency];

    return `${entry.flag} ${entry.label}`;
  }

  return `🌐 ${residency.toUpperCase()}`;
};
