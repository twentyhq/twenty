import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useDefaultFieldMetadataItemForFilter = () => {
  const { currentView } = useGetCurrentViewOnly();

  const objectMetadataId = currentView?.objectMetadataId;

  if (!isDefined(objectMetadataId)) {
    throw new Error('Object metadata id is missing from current view');
  }

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const availableFieldMetadataItemsForFilter = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataId,
    }),
  );

  const fieldMetadataItemForLabelIdentifier =
    availableFieldMetadataItemsForFilter.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id ===
        objectMetadataItem?.labelIdentifierFieldMetadataId,
    );

  const firstFieldMetadataItem = availableFieldMetadataItemsForFilter?.[0] as
    | FieldMetadataItem
    | undefined;

  const defaultFieldMetadataItemForFilter =
    fieldMetadataItemForLabelIdentifier ?? firstFieldMetadataItem;

  return { defaultFieldMetadataItemForFilter };
};
