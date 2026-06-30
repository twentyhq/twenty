import { type FilterableFieldType } from 'twenty-shared/types';

export const getSubMenuOptions = (subMenu: FilterableFieldType | null) => {
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
        {
          name: 'Workspace Member',
          icon: 'IconUserCircle',
          type: 'WORKSPACE_MEMBER',
        },
      ];
    default:
      return [];
  }
};
