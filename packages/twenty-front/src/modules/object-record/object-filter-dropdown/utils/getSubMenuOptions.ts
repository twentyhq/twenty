import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';

export const getSubMenuOptions = (subMenu: FilterType | null) => {
  switch (subMenu) {
    case 'ADDRESS':
      return [
        'Address 1',
        'Address 2',
        'City',
        'Post Code',
        'State',
        'Country',
      ];
    case 'FULL_NAME':
      return ['First Name', 'Last Name'];
    case 'LINKS':
      return ['Link URL', 'Link Label'];
    default:
      return [];
  }
};
