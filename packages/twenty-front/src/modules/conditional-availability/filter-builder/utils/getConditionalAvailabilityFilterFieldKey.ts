import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';

export const getConditionalAvailabilityFilterFieldKey = ({
  filterField,
}: {
  filterField: ConditionalAvailabilityFilterField;
}): string => {
  if ('field' in filterField) {
    return (
      filterField.field.relationFieldUniversalIdentifier ??
      filterField.field.fieldUniversalIdentifier
    );
  }

  return filterField.key;
};
