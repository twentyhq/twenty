import { PROVIDER_TYPE_LABELS } from '@/settings/admin-panel/ai/constants/ProviderTypeLabels';

export const getProviderTypeLabel = (type: string): string =>
  PROVIDER_TYPE_LABELS[type] ?? type;
