import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

// Fence for the 2.45 cross-upgrade window: a workspace the upgrade has not
// reached has no lastActivityAt field to order by yet. Remove once 2.45 leaves
// the window.
export const getAgentChatThreadLastActivityFieldName = (
  chatObjectMetadataItem:
    | Pick<EnrichedObjectMetadataItem, 'fields'>
    | null
    | undefined,
): 'lastActivityAt' | 'updatedAt' =>
  chatObjectMetadataItem?.fields.some(({ name }) => name === 'lastActivityAt')
    ? 'lastActivityAt'
    : 'updatedAt';
