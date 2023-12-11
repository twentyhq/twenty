import { OrderBy } from '@/object-metadata/types/OrderBy';

export type OrderByField = {
  [fieldName: string]: OrderBy | { [subFieldName: string]: OrderBy };
};
