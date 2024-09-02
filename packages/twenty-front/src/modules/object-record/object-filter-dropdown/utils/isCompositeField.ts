import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';

export const isCompositeField = (type: FilterType) =>
  ['ADDRESS', 'FULL_NAME', 'LINKS'].includes(type);
