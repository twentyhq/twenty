import { type DataResidency } from 'twenty-shared/ai';

import { DATA_RESIDENCY_CONFIG } from '@/settings/admin-panel/ai/constants/DataResidencyConfig';

export const DATA_RESIDENCY_OPTIONS = (
  Object.keys(DATA_RESIDENCY_CONFIG) as DataResidency[]
).map((key) => ({
  value: key,
  label: `${DATA_RESIDENCY_CONFIG[key].flag} ${DATA_RESIDENCY_CONFIG[key].label}`,
}));
