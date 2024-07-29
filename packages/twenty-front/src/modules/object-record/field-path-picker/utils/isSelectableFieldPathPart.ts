import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldTextMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const numericFieldMetadataTypes = new Set([
  FieldMetadataType.Currency,
  FieldMetadataType.Number,
  FieldMetadataType.Rating,
]);

export const isSelectableFieldPathPart = (
  field: Pick<
    FieldMetadataItem,
    | 'isActive'
    | 'isSystem'
    | 'type'
    | 'toRelationMetadata'
    | 'fromRelationMetadata'
  >,
): field is FieldDefinition<FieldTextMetadata> =>
  (field.isActive &&
    !field.isSystem &&
    numericFieldMetadataTypes.has(field.type)) ||
  (field.type === FieldMetadataType.Relation &&
    !field.toRelationMetadata?.fromObjectMetadata.isSystem &&
    !field.fromRelationMetadata?.toObjectMetadata.isSystem);
