import { inboxObjectNamesSelector } from '@/ai-chat/states/selectors/inboxObjectNamesSelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatThreadObjectMetadataItemSelector =
  createAtomSelector<EnrichedObjectMetadataItem | null>({
    key: 'aiChatThreadObjectMetadataItemSelector',
    get: ({ get }) =>
      get(objectMetadataItemFamilySelector, {
        objectName: get(inboxObjectNamesSelector).agentChatThread,
        objectNameType: 'singular',
      }),
  });
