import { isHiddenWorkspaceWorkflowRunColumnField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunColumnField';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { dedupeMorphRelationFieldMetadataItems } from '@/object-metadata/utils/dedupeMorphRelationFieldMetadataItems';
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
        ? dedupeMorphRelationFieldMetadataItems(
            objectMetadataItem.readableFields.filter(
              (fieldMetadata) =>
                (isActiveFieldMetadataItem({ fieldMetadata }) ||
                  fieldMetadata.id ===
                    objectMetadataItem.labelIdentifierFieldMetadataId) &&
                !isHiddenWorkspaceWorkflowRunColumnField({
                  objectNameSingular: objectMetadataItem.nameSingular,
                  fieldName: fieldMetadata.name,
                }),
            ),
          )
        : [],
    [objectMetadataItem],
  );

  return { activeFieldMetadataItems };
};
