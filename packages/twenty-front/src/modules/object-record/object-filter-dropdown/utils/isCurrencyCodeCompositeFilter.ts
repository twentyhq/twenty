import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';

export const isCurrencyCodeCompositeFilter = (
  filterDefinition: Pick<FilterDefinition, 'subFieldName'>,
) => {
  return (
    filterDefinition.subFieldName ===
    ('currencyCode' satisfies keyof FieldCurrencyValue)
  );
};
