import { type AiProviderItem } from '@/settings/admin-panel/ai/types/AiProviderItem';

// Backend stores providers as Record<providerId, RawAiProviderConfig>; the id is the
// record key, not a field on the value. Same shape as AiProviderItem minus `id`.
export type RawAiProviderConfig = Omit<AiProviderItem, 'id'>;
