import { objectMetadataItemsByUniversalIdentifierMapSelector } from '@/object-metadata/states/objectMetadataItemsByUniversalIdentifierMapSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const objectMetadataItemByUniversalIdentifierFamilySelector =
  createAtomFamilySelector<EnrichedObjectMetadataItem | null, string>({
    key: 'objectMetadataItemByUniversalIdentifierFamilySelector',
    get:
      (universalIdentifier) =>
      ({ get }) =>
        get(objectMetadataItemsByUniversalIdentifierMapSelector).get(
          universalIdentifier,
        ) ?? null,
    areEqual: (previous, next) => previous === next,
  });
