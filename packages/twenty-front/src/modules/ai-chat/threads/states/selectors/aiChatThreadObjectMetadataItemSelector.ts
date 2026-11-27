import { inboxNamesByLegacyNameSelector } from '@/ai-chat/states/selectors/inboxNamesByLegacyNameSelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatThreadObjectMetadataItemSelector =
  createAtomSelector<EnrichedObjectMetadataItem | null>({
    key: 'aiChatThreadObjectMetadataItemSelector',
    get: ({ get }) =>
      get(objectMetadataItemFamilySelector, {
        objectName: get(inboxNamesByLegacyNameSelector).agentChatThread,
        objectNameType: 'singular',
      }),
  });
