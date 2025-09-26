import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconDatabase, IconFilter, IconTag } from 'twenty-ui/display';

export const GAUGE_CHART_SETTINGS: ChartSettingsGroup[] = [
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
        Icon: IconDatabase,
        label: 'Total Value Source',
        id: 'total-source',
        contextualTextPosition: 'right',
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
