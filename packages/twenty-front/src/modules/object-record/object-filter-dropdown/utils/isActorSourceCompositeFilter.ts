import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';

export const isActorSourceCompositeFilter = (
  filterDefinition: Pick<FilterDefinition, 'subFieldName'>,
) => {
  return (
    filterDefinition.subFieldName === ('source' satisfies keyof FieldActorValue)
  );
};
