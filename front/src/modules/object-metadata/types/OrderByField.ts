import { OrderBy } from '@/search/hooks/useFilteredSearchEntityQuery';

export type OrderByField = {
  [fieldName: string]: OrderBy | { [subFieldName: string]: OrderBy };
};
