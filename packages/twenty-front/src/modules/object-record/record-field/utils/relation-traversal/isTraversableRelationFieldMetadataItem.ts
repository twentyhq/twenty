import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

type IsTraversableRelationFieldMetadataItemOptions = {
  sourceObjectMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

// A view field can traverse a plain many-to-one relation only: each row then
// reaches at most one related record, and junction relations carry no scalar
// value of their own.
export const isTraversableRelationFieldMetadataItem = (
  fieldMetadataItem: FieldMetadataItem,
  {
    sourceObjectMetadataId,
    objectMetadataItems,
  }: IsTraversableRelationFieldMetadataItemOptions,
): fieldMetadataItem is FieldMetadataItem & {
  relation: NonNullable<FieldMetadataItem['relation']>;
} => {
  if (!isManyToOneRelationField(fieldMetadataItem)) {
    return false;
  }

  const junctionConfig = resolveJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId: fieldMetadataItem.relation.targetObjectMetadata.id,
    relationTargetFieldMetadataId:
      fieldMetadataItem.relation.targetFieldMetadata.id,
    sourceObjectMetadataId,
    objectMetadataItems,
  });

  return !isDefined(junctionConfig);
};
