import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const objectMetadataItemsByUniversalIdentifierMapSelector =
  createAtomSelector<Map<string, EnrichedObjectMetadataItem>>({
    key: 'objectMetadataItemsByUniversalIdentifierMapSelector',
    get: ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsWithFieldsSelector);

      return new Map(
        objectMetadataItems.map((objectMetadataItem) => [
          objectMetadataItem.universalIdentifier,
          objectMetadataItem,
        ]),
      );
    },
  });
