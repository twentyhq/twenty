import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';

export const getSubMenuOptions = (subMenu: FilterType | null) => {
  switch (subMenu) {
    case 'ACTOR':
      return [
        {
          name: 'Creation Source',
          icon: 'IconPlug',
          type: 'SOURCE',
        },
        {
          name: 'Creator Name',
          icon: 'IconId',
          type: 'ACTOR',
        },
      ];
    default:
      return [];
  }
};
