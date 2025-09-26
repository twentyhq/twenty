import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import {
  IconArrowsSort,
  IconColorSwatch,
  IconDatabase,
  IconFilter,
  IconFilters,
  IconTag,
} from 'twenty-ui/display';

export const PIE_CHART_SETTINGS: ChartSettingsGroup[] = [
  {
    heading: 'Data',
    items: [
      {
        Icon: IconDatabase,
        label: 'Source',
        id: 'source',
        contextualTextPosition: 'right',
        hasSubMenu: true,
        isSubMenuOpened: false,
        onClick: () => {},
      },
      {
        Icon: IconFilter,
        label: 'Filter',
        id: 'filter',
        contextualTextPosition: 'right',
        hasSubMenu: true,
        isSubMenuOpened: false,
        onClick: () => {},
      },
      {
        Icon: IconFilters,
        label: 'Group by',
        id: 'group-by',
        hasSubMenu: true,
        isSubMenuOpened: false,
        onClick: () => {},
      },
      {
        Icon: IconArrowsSort,
        label: 'Sort by',
        id: 'sort-by',
        hasSubMenu: true,
        isSubMenuOpened: false,
        onClick: () => {},
      },
    ],
  },
  {
    heading: 'Style',
    items: [
      {
        Icon: IconColorSwatch,
        label: 'Colors',
        id: 'colors',
        hasSubMenu: true,
        isSubMenuOpened: false,
        onClick: () => {},
      },
      {
        Icon: IconTag,
        label: 'Data labels',
        id: 'data-labels',
        hasSubMenu: true,
        isSubMenuOpened: false,
        onClick: () => {},
      },
    ],
  },
];
