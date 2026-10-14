import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { isTraversableRelationFieldMetadataItem } from '@/object-record/record-field/utils/relation-traversal/isTraversableRelationFieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export type TraversableRelationFieldMetadataItem = {
  relationFieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
};

export const getTraversableRelationFieldMetadataItems = ({
  objectMetadataItem,
  objectMetadataItems,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): TraversableRelationFieldMetadataItem[] =>
  objectMetadataItem.readableFields.flatMap((fieldMetadataItem) => {
    if (
      !isActiveFieldMetadataItem({ fieldMetadata: fieldMetadataItem }) ||
      !isTraversableRelationFieldMetadataItem(fieldMetadataItem)
    ) {
      return [];
    }

    const targetObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItemToFind) =>
        objectMetadataItemToFind.id ===
        fieldMetadataItem.relation.targetObjectMetadata.id,
    );

    if (!isDefined(targetObjectMetadataItem)) {
      return [];
    }

    return [
      {
        relationFieldMetadataItem: fieldMetadataItem,
        targetObjectMetadataItem,
      },
    ];
  });
