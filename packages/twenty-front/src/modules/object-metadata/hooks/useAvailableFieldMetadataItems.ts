import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { TABLE_COLUMNS_DENY_LIST } from '@/object-record/constants/TableColumnsDenyList';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

export const useAvailableFieldMetadataItems = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const availableFieldMetadataItems = useMemo(
    () =>
      objectMetadataItem.readableFields.filter((fieldMetadataItemToFilter) => {
        return (
          fieldMetadataItemToFilter.isActive &&
          !fieldMetadataItemToFilter.isSystem &&
          !TABLE_COLUMNS_DENY_LIST.includes(fieldMetadataItemToFilter.name) &&
          fieldMetadataItemToFilter.type !== FieldMetadataType.UUID
        );
      }),
    [objectMetadataItem],
  );

  return { availableFieldMetadataItems };
};
