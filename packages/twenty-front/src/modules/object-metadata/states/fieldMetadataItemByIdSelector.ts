import { fieldMetadataItemByIdMapSelector } from '@/object-metadata/states/fieldMetadataItemByIdMapSelector';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const fieldMetadataItemByIdSelector = createAtomFamilySelector({
  key: 'fieldMetadataItemByIdSelector',
  get:
    ({ fieldMetadataItemId }: { fieldMetadataItemId: string }) =>
    ({ get }) => {
      const foundFieldMetadataItem = get(fieldMetadataItemByIdMapSelector).get(
        fieldMetadataItemId,
      );

      if (
        !isDefined(foundFieldMetadataItem) ||
        !isDefined(foundFieldMetadataItem.objectMetadataId)
      ) {
        return {};
      }

      const foundObjectMetadataItem = get(
        objectMetadataItemsByIdMapSelector,
      ).get(foundFieldMetadataItem.objectMetadataId);

      if (!isDefined(foundObjectMetadataItem)) {
        return {};
      }

      return {
        foundFieldMetadataItem,
        foundObjectMetadataItem,
      };
    },
  areEqual: (previous, next) =>
    previous.foundFieldMetadataItem === next.foundFieldMetadataItem &&
    previous.foundObjectMetadataItem === next.foundObjectMetadataItem,
});
