import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const dashboardFilterValuesComponentState =
  createAtomComponentState<DashboardFilterValues>({
    key: 'dashboardFilterValuesComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
