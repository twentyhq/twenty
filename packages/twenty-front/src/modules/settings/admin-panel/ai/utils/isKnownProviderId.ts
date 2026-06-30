import { PROVIDER_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/ProviderConfig';

export type KnownProviderId = keyof typeof PROVIDER_ICON_CONFIG;

export const isKnownProviderId = (id: string): id is KnownProviderId =>
  id in PROVIDER_ICON_CONFIG;
