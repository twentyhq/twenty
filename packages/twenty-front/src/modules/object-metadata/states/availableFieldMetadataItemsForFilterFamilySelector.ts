import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMetadataItemFilterable } from '@/object-metadata/utils/isFieldMetadataItemFilterable';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const availableFieldMetadataItemsForFilterFamilySelector =
  createAtomFamilySelector<
    FieldMetadataItem[],
    { objectMetadataItemId: string }
  >({
    key: 'availableFieldMetadataItemsForFilterFamilySelector',
    get:
      ({ objectMetadataItemId }: { objectMetadataItemId: string }) =>
      ({ get }) => {
        const objectMetadataItems = get(objectMetadataItemsWithFieldsSelector);

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === objectMetadataItemId,
        );
        if (!isDefined(objectMetadataItem)) {
          return [];
        }

        return objectMetadataItem.readableFields.filter(
          isFieldMetadataItemFilterable,
        );
      },
  });
