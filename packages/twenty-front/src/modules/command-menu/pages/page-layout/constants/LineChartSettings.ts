import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import {
  IconArrowsSort,
  IconAxisX,
  IconAxisY,
  IconColorSwatch,
  IconDatabase,
  IconFilter,
  IconFilters,
  IconMathXy,
  IconTag,
} from 'twenty-ui/display';

export const LINE_CHART_SETTINGS: ChartSettingsGroup[] = [
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
    ],
  },
  {
    heading: 'X axis',
    items: [
      {
        Icon: IconAxisX,
        label: 'Data on display',
        id: 'data-on-display-x',
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
    heading: 'Y axis',
    items: [
      {
        Icon: IconAxisY,
        label: 'Data on display',
        id: 'data-on-display-y',
        hasSubMenu: true,
        isSubMenuOpened: false,
        onClick: () => {},
      },
      {
        Icon: IconFilters,
        label: 'Group by',
        id: 'group-by-y',
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
        Icon: IconMathXy,
        label: 'Axis name',
        id: 'axis-name',
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
