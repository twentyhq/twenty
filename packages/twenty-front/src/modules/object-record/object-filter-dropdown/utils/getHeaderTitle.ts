import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';

export const getHeaderTitle = (
  subMenu: FilterType | null,
): string | undefined => {
  switch (subMenu) {
    case 'ACTOR':
      return 'Actor';
    case 'SOURCE':
      return 'Creation Source';
    default:
      return undefined;
  }
};
