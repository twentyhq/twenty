import { OrderBy } from '@/object-metadata/types/OrderBy';

export type RecordGqlOperationOrderBy = {
  [fieldName: string]: OrderBy | { [subFieldName: string]: OrderBy };
};
