import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { ViewFilter } from '@/views/types/ViewFilter';
import { Field, FieldMetadataType } from '~/generated/graphql';
import { resolveDateViewFilterValue } from './resolveDateViewFilterValue';

export const resolveVariableViewFilterValue = (
  viewFilter: Pick<ViewFilter, 'fieldMetadataId' | 'value' | 'valueType'>,
  fields: Field[],
) => {
  const field = fields.find((field) => field.id === viewFilter.fieldMetadataId);

  if (!field) throw new Error('Field not found');

  switch (field.type) {
    case FieldMetadataType.Date:
    case FieldMetadataType.DateTime:
      return resolveDateViewFilterValue(viewFilter);
    /* case FieldMetadataType.Number:
      return +viewFilter.value;
    */
    default:
      return viewFilter.value;
  }
};

type ResolvedFilterValue<T extends FieldMetadataType> = T extends
  | FieldMetadataType.Date
  | FieldMetadataType.DateTime
  ? ReturnType<typeof resolveDateViewFilterValue>
  : T extends FieldMetadataType.Number
    ? number
    : string;

export const resolveFilterValue = <T extends FieldMetadataType>(
  filter?:
    | (Pick<Filter, 'valueType' | 'value'> & {
        definition: {
          type: Filter['definition']['type'];
        };
      })
    | null,
): ResolvedFilterValue<T> | null => {
  if (!filter || !filter.value) return null;

  switch (filter.definition.type) {
    case FieldMetadataType.Date:
    case FieldMetadataType.DateTime:
      return resolveDateViewFilterValue(filter) as ResolvedFilterValue<T>;
    case FieldMetadataType.Number:
      return Number(filter.value) as ResolvedFilterValue<T>;
    default:
      return filter.value as ResolvedFilterValue<T>;
  }
};
