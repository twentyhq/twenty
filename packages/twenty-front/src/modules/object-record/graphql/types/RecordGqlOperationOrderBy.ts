import { OrderBy } from '@/object-metadata/types/OrderBy';

export type RecordGqlOperationOrderBy = Array<{
  [fieldName: string]: OrderBy | { [subFieldName: string]: OrderBy };
}>;
