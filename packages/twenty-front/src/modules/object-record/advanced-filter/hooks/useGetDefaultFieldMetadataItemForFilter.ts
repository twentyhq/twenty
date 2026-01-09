import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';

export const useGetDefaultFieldMetadataItemForFilter = () => {
  const getDefaultFieldMetadataItemForFilter = useRecoilCallback(
    ({ snapshot }) =>
      (objectMetadataItem: ObjectMetadataItem) => {
        const availableFieldMetadataItemsForFilter = getSnapshotValue(
          snapshot,
          availableFieldMetadataItemsForFilterFamilySelector({
            objectMetadataItemId: objectMetadataItem.id,
          }),
        );

        const fieldMetadataItemForLabelIdentifier =
          availableFieldMetadataItemsForFilter.find(
            (fieldMetadataItem) =>
              fieldMetadataItem.id ===
              objectMetadataItem?.labelIdentifierFieldMetadataId,
          );

        const firstFieldMetadataItem =
          availableFieldMetadataItemsForFilter?.[0] as
            | FieldMetadataItem
            | undefined;

        const defaultFieldMetadataItemForFilter =
          fieldMetadataItemForLabelIdentifier ?? firstFieldMetadataItem;

        return { defaultFieldMetadataItemForFilter };
      },
    [],
  );

  return {
    getDefaultFieldMetadataItemForFilter,
  };
};
