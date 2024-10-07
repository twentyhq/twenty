import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';

export const getHeaderTitle = (
  subMenu: FilterableFieldType | null,
): string | undefined => {
  switch (subMenu) {
    case 'ACTOR':
      return 'Actor';
    default:
      return undefined;
  }
};
