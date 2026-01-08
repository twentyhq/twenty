import { type OrderBy } from '@/types/OrderBy';

// Supports up to 3 levels of nesting:
// - Level 1: { field: OrderBy } - scalar fields
// - Level 2: { field: { subField: OrderBy } } - composite fields
// - Level 3: { relation: { compositeField: { subField: OrderBy } } } - relation + composite
type OrderBySubField = OrderBy | { [subSubFieldName: string]: OrderBy };

export type RecordGqlOperationOrderBy = Array<{
  [fieldName: string]: OrderBy | { [subFieldName: string]: OrderBySubField };
}>;
