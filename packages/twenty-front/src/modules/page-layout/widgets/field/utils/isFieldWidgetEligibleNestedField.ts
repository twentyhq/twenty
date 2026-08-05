import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

export const isFieldWidgetEligibleNestedField = (
  fieldMetadataItem: FieldMetadataItem,
): boolean =>
  (fieldMetadataItem.isActive ?? false) &&
  isOneToManyRelationField(fieldMetadataItem) &&
  isDefined(fieldMetadataItem.relation.targetObjectMetadata.id) &&
  isDefined(fieldMetadataItem.relation.targetFieldMetadata.id) &&
  !hasJunctionConfig(fieldMetadataItem.settings);
