import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useMemo } from 'react';

export const useActiveFieldMetadataItems = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const activeFieldMetadataItems = useMemo(
    () =>
      objectMetadataItem
        ? objectMetadataItem.fields.filter(
            ({ isActive, isSystem }) => isActive && !isSystem,
          )
        : [],
    [objectMetadataItem],
  );

  return { activeFieldMetadataItems };
};
