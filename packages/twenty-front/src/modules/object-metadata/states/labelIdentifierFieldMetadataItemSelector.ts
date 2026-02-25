import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const labelIdentifierFieldMetadataItemSelector =
  createAtomFamilySelector({
    key: 'labelIdentifierFieldMetadataItemSelector',
    get:
      ({ objectMetadataItemId }: { objectMetadataItemId: string }) =>
      ({ get }) => {
        const objectMetadataItems = get(objectMetadataItemsState);

        const objectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.id === objectMetadataItemId,
        );

        if (!isDefined(objectMetadataItem)) {
          return undefined;
        }

        return objectMetadataItem.fields.find((fieldMetadataItemToFind) =>
          isLabelIdentifierField({
            fieldMetadataItem: fieldMetadataItemToFind,
            objectMetadataItem: objectMetadataItem,
          }),
        );
      },
  });
