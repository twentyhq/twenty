import { isDataResidency } from 'twenty-shared/ai';

import { DATA_RESIDENCY_CONFIG } from '@/settings/admin-panel/ai/constants/DataResidencyConfig';

export const getDataResidencyDisplay = (residency: string): string => {
  if (isDataResidency(residency)) {
    const entry = DATA_RESIDENCY_CONFIG[residency];

    return `${entry.flag} ${entry.label}`;
  }

  return `🌐 ${residency.toUpperCase()}`;
};
