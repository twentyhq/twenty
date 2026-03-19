import { DATA_RESIDENCY_CONFIG } from '@/settings/admin-panel/ai/constants/DataResidencyConfig';

export const getDataResidencyLabel = (residency: string): string => {
  return DATA_RESIDENCY_CONFIG[residency]?.label ?? residency.toUpperCase();
};
