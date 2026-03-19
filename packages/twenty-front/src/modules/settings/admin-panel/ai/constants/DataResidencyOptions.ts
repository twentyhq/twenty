import { DATA_RESIDENCY_CONFIG } from '@/settings/admin-panel/ai/constants/DataResidencyConfig';

export const DATA_RESIDENCY_OPTIONS = Object.entries(DATA_RESIDENCY_CONFIG).map(
  ([value, { label, flag }]) => ({
    value,
    label: `${flag} ${label}`,
  }),
);
