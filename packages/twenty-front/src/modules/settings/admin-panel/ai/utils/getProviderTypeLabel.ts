import { PROVIDER_CONFIG } from '@/settings/admin-panel/ai/constants/ProviderConfig';

export const getProviderTypeLabel = (type: string): string =>
  PROVIDER_CONFIG[type]?.label ?? type;
