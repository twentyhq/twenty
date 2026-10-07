import { BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInDateDashboardFilterSlotId';
import { type BuiltInDashboardFilterSlot } from '@/page-layout/dashboard-filters/types/BuiltInDashboardFilterSlot';
import { msg } from '@lingui/core/macro';
import { ViewFilterOperand } from 'twenty-shared/types';

export const BUILT_IN_DASHBOARD_FILTER_SLOTS: BuiltInDashboardFilterSlot[] = [
  {
    id: BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID,
    label: msg`Date`,
    filterType: 'DATE_TIME',
    defaultOperand: ViewFilterOperand.IS_RELATIVE,
  },
];
