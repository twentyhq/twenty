import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type DashboardFilterValue } from 'twenty-shared/types';

export const dashboardFilterValuesComponentState = createAtomComponentState<
  Record<string, DashboardFilterValue | undefined>
>({
  key: 'dashboardFilterValuesComponentState',
  defaultValue: {},
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
