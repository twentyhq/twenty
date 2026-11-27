import { type ConditionalAvailabilityFilterFieldType } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterFieldType';
import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterFieldTypeOperators = ({
  type,
}: {
  type: ConditionalAvailabilityFilterFieldType;
}): [
  ConditionalAvailabilityFilterOperator,
  ...ConditionalAvailabilityFilterOperator[],
] => {
  switch (type) {
    case FieldMetadataType.SELECT:
    case FieldMetadataType.RELATION:
      return ['is', 'isNot', 'isAnyOf', 'isNoneOf'];
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.CURRENCY:
    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME:
      return ['is', 'isNot', 'greaterThanOrEqual', 'lessThanOrEqual'];
    case FieldMetadataType.TEXT:
      return ['is', 'isNot'];
    case FieldMetadataType.BOOLEAN:
      return ['is'];
    default:
      return assertUnreachable(type);
  }
};
