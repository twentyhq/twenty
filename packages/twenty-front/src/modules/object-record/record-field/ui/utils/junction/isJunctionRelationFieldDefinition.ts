import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { type JunctionObjectMetadataItem } from '@/object-record/record-field/ui/utils/junction/types/JunctionObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const isJunctionRelationFieldDefinition = ({
  fieldDefinition,
  objectMetadataItems,
}: {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  objectMetadataItems: JunctionObjectMetadataItem[];
}) => {
  if (!isFieldRelation(fieldDefinition)) {
    return false;
  }

  const sourceObjectMetadataId = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular ===
      fieldDefinition.metadata.objectMetadataNameSingular,
  )?.id;

  return isDefined(
    resolveJunctionConfig({
      settings: fieldDefinition.metadata.settings,
      relationObjectMetadataId:
        fieldDefinition.metadata.relationObjectMetadataId,
      relationTargetFieldMetadataId:
        fieldDefinition.metadata.relationFieldMetadataId,
      sourceObjectMetadataId,
      objectMetadataItems,
    }),
  );
};
