import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isSelectableFieldPathPart } from '@/object-record/field-path-picker/utils/isSelectableFieldPathPart';

export const getViewFieldMetadataItems = (
  objectMetadataItems: ObjectMetadataItem[],
  sourceObjectMetadata: ObjectMetadataItem,
  fieldPath: string[] | undefined | null,
) => {
  const fieldPathFieldMetadataIds = fieldPath ?? [];

  const allFieldMetadataItems = objectMetadataItems
    .flatMap((objectMetadata) => objectMetadata.fields)
    .filter(isSelectableFieldPathPart);

  let viewFieldMetadataItems = sourceObjectMetadata.fields.filter(
    isSelectableFieldPathPart,
  );

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

    viewFieldMetadataItems = nextObjectMetadata.fields.filter(
      isSelectableFieldPathPart,
    );
  }

  return viewFieldMetadataItems;
};
