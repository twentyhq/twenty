import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { TABLE_COLUMNS_DENY_LIST } from '@/object-record/constants/TableColumnsDenyList';
import { useMemo } from 'react';

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
          !isHiddenSystemField(fieldMetadataItemToFilter) &&
          !TABLE_COLUMNS_DENY_LIST.includes(fieldMetadataItemToFilter.name)
        );
      }),
    [objectMetadataItem],
  );

  return { availableFieldMetadataItems };
};
