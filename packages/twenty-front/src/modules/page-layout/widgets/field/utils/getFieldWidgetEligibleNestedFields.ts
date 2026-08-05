import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export const isFieldWidgetEligibleNestedField = (
  fieldMetadataItem: FieldMetadataItem,
): boolean =>
  fieldMetadataItem.isActive === true &&
  fieldMetadataItem.type === FieldMetadataType.RELATION &&
  fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY &&
  isDefined(fieldMetadataItem.relation.targetObjectMetadata.id) &&
  isDefined(fieldMetadataItem.relation.targetFieldMetadata.id) &&
  !hasJunctionConfig(fieldMetadataItem.settings);

export const getFieldWidgetEligibleNestedFields = (
  relationTargetObjectMetadataItem: EnrichedObjectMetadataItem,
): FieldMetadataItem[] =>
  relationTargetObjectMetadataItem.readableFields
    .filter(isFieldWidgetEligibleNestedField)
    .toSorted((fieldA, fieldB) => fieldA.label.localeCompare(fieldB.label));
