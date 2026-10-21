import { isDataResidency } from 'twenty-shared/ai';
import { DATA_RESIDENCY_CONFIG } from '@/ai/constants/DataResidencyConfig';
import { t } from '@lingui/core/macro';

export const getDataResidencyDisplay = (residency: string): string => {
  if (isDataResidency(residency)) {
    const entry = DATA_RESIDENCY_CONFIG[residency];

    return `${entry.flag} ${t(entry.label)}`;
  }

  return `🌐 ${residency.toUpperCase()}`;
};
