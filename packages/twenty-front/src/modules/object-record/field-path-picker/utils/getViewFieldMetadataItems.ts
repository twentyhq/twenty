import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getViewFieldMetadataItems = (
  objectMetadataItems: ObjectMetadataItem[],
  sourceObjectMetadata: ObjectMetadataItem,
  fieldPath: string[] | undefined | null,
) => {
  const fieldPathFieldMetadataIds = fieldPath ?? [];

  const allFieldMetadataItems = objectMetadataItems
    .flatMap((objectMetadata) => objectMetadata.fields)
    .filter(
      (fieldMetadata) => fieldMetadata.isActive && !fieldMetadata.isSystem,
    );

  let viewFieldMetadataItems = sourceObjectMetadata.fields;

  for (const fieldPathFieldMetadataId of fieldPathFieldMetadataIds) {
    const fieldPathFieldMetadata = allFieldMetadataItems.find(
      (fieldMetadata) => fieldMetadata.id === fieldPathFieldMetadataId,
    );
    if (!fieldPathFieldMetadata)
      throw new Error(
        `Could not resolve field metadata id '${fieldPathFieldMetadataId}' in field path.`,
      );
    const { relationDefinition } = fieldPathFieldMetadata;
    if (!relationDefinition) return []; // TODO: Throw error?

    const nextObjectMetadataId =
      relationDefinition.sourceFieldMetadata.id === fieldPathFieldMetadataId
        ? relationDefinition.targetObjectMetadata.id
        : relationDefinition.sourceObjectMetadata.id;
    const nextObjectMetadata = objectMetadataItems.find(
      (objectMetadata) => objectMetadata.id === nextObjectMetadataId,
    );
    if (!nextObjectMetadata) throw new Error();

    viewFieldMetadataItems = nextObjectMetadata.fields;
  }

  return viewFieldMetadataItems;
};
