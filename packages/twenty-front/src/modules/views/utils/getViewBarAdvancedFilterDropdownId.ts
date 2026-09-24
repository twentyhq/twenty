import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

export const getViewBarAdvancedFilterDropdownId = (viewBarId: string) =>
  `${ViewBarFilterDropdownIds.ADVANCED}-${viewBarId}`;
