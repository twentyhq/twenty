import { DATA_RESIDENCY_CONFIG } from '@/settings/admin-panel/ai/constants/DataResidencyConfig';

export const getDataResidencyFlag = (residency: string): string => {
  return DATA_RESIDENCY_CONFIG[residency]?.flag ?? '🌐';
};
