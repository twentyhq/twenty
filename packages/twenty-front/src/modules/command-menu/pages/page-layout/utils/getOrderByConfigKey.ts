import { type ChartManualSortAxis } from '@/command-menu/pages/page-layout/utils/getManualSortConfigKey';

export const getOrderByConfigKey = (axis: ChartManualSortAxis) => {
  switch (axis) {
    case 'pie':
      return 'orderBy' as const;
    case 'primary':
      return 'primaryAxisOrderBy' as const;
    case 'secondary':
      return 'secondaryAxisOrderBy' as const;
  }
};
