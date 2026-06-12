import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { useMemo } from 'react';

export const useActiveFieldMetadataItems = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const activeFieldMetadataItems = useMemo(
    () =>
      isDefined(objectMetadataItem)
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
