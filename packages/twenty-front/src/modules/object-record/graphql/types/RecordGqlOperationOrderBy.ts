import { type OrderBy } from '@/types/OrderBy';

export type RecordGqlOperationOrderBy = Array<{
  [fieldName: string]: OrderBy | { [subFieldName: string]: OrderBy };
}>;
