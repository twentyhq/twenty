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
            (fieldMetadata) =>
              isActiveFieldMetadataItem({ fieldMetadata }) ||
              fieldMetadata.id ===
                objectMetadataItem.labelIdentifierFieldMetadataId,
          )
        : [],
    [objectMetadataItem],
  );

  return { activeFieldMetadataItems };
};
