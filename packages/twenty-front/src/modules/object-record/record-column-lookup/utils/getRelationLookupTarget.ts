import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { findById, isDefined } from 'twenty-shared/utils';

export const getRelationLookupTarget = ({
  relationFieldMetadataItem,
  relationTargetFieldMetadataId,
  objectMetadataItems,
}: {
  relationFieldMetadataItem: Pick<FieldMetadataItem, 'name' | 'relation'>;
  relationTargetFieldMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordFieldLookupTarget | undefined => {
  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem: relationFieldMetadataItem,
    objectMetadataItems,
  });

  const lookupTargetFieldMetadataItem = relationObjectMetadataItem?.fields.find(
    findById(relationTargetFieldMetadataId),
  );

  if (
    !isDefined(relationObjectMetadataItem) ||
    !isDefined(lookupTargetFieldMetadataItem)
  ) {
    return undefined;
  }

  return {
    relationFieldName: relationFieldMetadataItem.name,
    relationObjectMetadataItem,
    lookupTargetFieldMetadataItem,
    lookupTargetFieldDefinition: formatFieldMetadataItemAsFieldDefinition({
      field: lookupTargetFieldMetadataItem,
      objectMetadataItem: relationObjectMetadataItem,
    }),
  };
};
