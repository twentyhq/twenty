export type ChartManualSortAxis = 'primary' | 'secondary' | 'pie';

export const getManualSortConfigKey = (axis: ChartManualSortAxis) => {
  switch (axis) {
    case 'pie':
      return 'manualSortOrder' as const;
    case 'primary':
      return 'primaryAxisManualSortOrder' as const;
    case 'secondary':
      return 'secondaryAxisManualSortOrder' as const;
  }
};
