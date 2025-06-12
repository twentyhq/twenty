import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useDefaultFieldMetadataItemForFilter = () => {
  const { currentView } = useGetCurrentViewOnly();
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const objectMetadataId =
    currentView?.objectMetadataId ?? activeObjectMetadataItems[0]?.id;

  if (!isDefined(objectMetadataId)) {
    throw new Error('Could not find default object metadata item for filter');
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
