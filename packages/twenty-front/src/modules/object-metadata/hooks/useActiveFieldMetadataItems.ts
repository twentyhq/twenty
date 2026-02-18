import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
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
            ({ id, isActive, isSystem, name }) =>
              isActiveFieldMetadataItem({
                objectNameSingular: objectMetadataItem.nameSingular,
                fieldMetadata: { isActive, isSystem, name },
              }) ||
              // Allow label identifier field even if it's a system field
              id === objectMetadataItem.labelIdentifierFieldMetadataId,
          )
        : [],
    [objectMetadataItem],
  );

  return { activeFieldMetadataItems };
};
