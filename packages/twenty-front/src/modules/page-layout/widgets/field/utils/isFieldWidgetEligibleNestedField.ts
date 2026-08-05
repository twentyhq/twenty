import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';
import { isDefined } from 'twenty-shared/utils';

export const isFieldWidgetEligibleNestedField = (
  fieldMetadataItem: FieldMetadataItem,
): boolean =>
  (fieldMetadataItem.isActive ?? false) &&
  isPlainOneToManyRelationField(fieldMetadataItem) &&
  isDefined(fieldMetadataItem.relation.targetObjectMetadata.id) &&
  isDefined(fieldMetadataItem.relation.targetFieldMetadata.id);
