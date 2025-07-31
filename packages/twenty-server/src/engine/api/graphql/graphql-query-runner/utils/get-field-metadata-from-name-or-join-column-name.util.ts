import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export function getFieldMetadataFromNameOrJoinColumnName({
  objectMetadataItem,
  fieldName,
}: {
  objectMetadataItem: ObjectMetadataItemWithFieldMaps;
  fieldName: string;
}) {
  const sourceFieldMetadataId = objectMetadataItem.fieldIdByName[fieldName];
  let sourceFieldMetadata =
    objectMetadataItem.fieldsById[sourceFieldMetadataId];

  // If empty, it could be a morph relation
  if (!sourceFieldMetadata) {
    const sourceFieldMetadataId =
      objectMetadataItem.fieldIdByJoinColumnName[`${fieldName}Id`];

    sourceFieldMetadata = objectMetadataItem.fieldsById[sourceFieldMetadataId];
  }

  return sourceFieldMetadata;
}
