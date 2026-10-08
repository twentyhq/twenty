import { objectMetadataItemsByNamePluralMapSelector } from '@/object-metadata/states/objectMetadataItemsByNamePluralMapSelector';
import { objectMetadataItemsByNameSingularMapSelector } from '@/object-metadata/states/objectMetadataItemsByNameSingularMapSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

type ObjectMetadataItemSelector = {
  objectName: string;
  objectNameType: 'singular' | 'plural';
};

export const objectMetadataItemFamilySelector = createAtomFamilySelector<
  EnrichedObjectMetadataItem | null,
  ObjectMetadataItemSelector
>({
  key: 'objectMetadataItemFamilySelector',
  get:
    ({ objectNameType, objectName }: ObjectMetadataItemSelector) =>
    ({ get }) => {
      if (objectNameType === 'singular') {
        return (
          get(objectMetadataItemsByNameSingularMapSelector).get(objectName) ??
          null
        );
      } else if (objectNameType === 'plural') {
        return (
          get(objectMetadataItemsByNamePluralMapSelector).get(objectName) ??
          null
        );
      }
      return null;
    },
  areEqual: (previous, next) => previous === next,
});
