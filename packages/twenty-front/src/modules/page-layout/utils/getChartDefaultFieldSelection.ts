import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { getChartDefaultOrderByForFieldType } from '@/side-panel/pages/page-layout/utils/getChartDefaultOrderByForFieldType';
import {
  isDefined,
  isFieldMetadataSupportedInGroupBy,
} from 'twenty-shared/utils';
import {
  AggregateOperations,
  FieldMetadataType,
} from '~/generated-metadata/graphql';

const SUMMABLE_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.CURRENCY,
  FieldMetadataType.NUMBER,
]);

export const getChartDefaultFieldSelection = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'readableFields' | 'labelIdentifierFieldMetadataId'
  >,
): GraphWidgetFieldSelection => {
  const usableFields = objectMetadataItem.readableFields.filter(
    (field) =>
      field.isActive &&
      !isHiddenSystemField(field) &&
      !isFieldRelation(field) &&
      !isFieldMorphRelation(field),
  );

  const summableField = usableFields.find((field) =>
    SUMMABLE_FIELD_TYPES.has(field.type),
  );

  const countedField =
    usableFields.find(
      (field) => field.id === objectMetadataItem.labelIdentifierFieldMetadataId,
    ) ?? usableFields[0];

  // Composite fields need a sub-field to be grouped by, which has no sensible default
  const groupableFields = usableFields.filter(
    (field) =>
      !isCompositeFieldType(field.type) &&
      isFieldMetadataSupportedInGroupBy({
        type: field.type,
        name: field.name,
        isSystem: field.isSystem ?? false,
      }),
  );

  const groupByField =
    groupableFields.find((field) => field.type === FieldMetadataType.SELECT) ??
    groupableFields[0];

  const groupBy = {
    groupByFieldMetadataId: groupByField?.id,
    groupByOrderBy: isDefined(groupByField)
      ? getChartDefaultOrderByForFieldType(groupByField.type)
      : undefined,
  };

  if (isDefined(summableField)) {
    return {
      objectMetadataId: objectMetadataItem.id,
      aggregateFieldMetadataId: summableField.id,
      aggregateOperation: AggregateOperations.SUM,
      ...groupBy,
    };
  }

  return {
    objectMetadataId: objectMetadataItem.id,
    aggregateFieldMetadataId: countedField?.id,
    aggregateOperation: AggregateOperations.COUNT,
    ...groupBy,
  };
};
