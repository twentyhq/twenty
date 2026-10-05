import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

export const getViewBarFilterDropdownId = (viewBarId: string) =>
  `${ViewBarFilterDropdownIds.MAIN}-${viewBarId}`;
