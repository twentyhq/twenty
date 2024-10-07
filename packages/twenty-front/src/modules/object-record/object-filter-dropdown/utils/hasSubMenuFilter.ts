import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';

export const hasSubMenuFilter = (type: FilterableFieldType) =>
  ['ACTOR'].includes(type);
