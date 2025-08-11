import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useMemo } from 'react';

export const useActiveFieldMetadataItems = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const activeFieldMetadataItems = useMemo(
    () =>
      objectMetadataItem
        ? objectMetadataItem.readableFields.filter(
            ({ isActive, isSystem }) => isActive && !isSystem,
          )
        : [],
    [objectMetadataItem],
  );

  return { activeFieldMetadataItems };
};
