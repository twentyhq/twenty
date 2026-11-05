import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const objectMetadataItemsByUniversalIdentifierMapSelector =
  createAtomSelector<Map<string, EnrichedObjectMetadataItem>>({
    key: 'objectMetadataItemsByUniversalIdentifierMapSelector',
    get: ({ get }) =>
      new Map(
        get(objectMetadataItemsWithFieldsSelector).map((objectMetadataItem) => [
          objectMetadataItem.universalIdentifier,
          objectMetadataItem,
        ]),
      ),
  });
