import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type DashboardFilterValue } from 'twenty-shared/types';

// The value a chart bucket wrote, per slot. A slot counts as cross-filtered only while its value still equals
// this one, so Reset, the URL and Back/Forward un-mark it without knowing cross-filters exist.
export const dashboardFilterCrossFilterValuesComponentState =
  createAtomComponentState<Record<string, DashboardFilterValue>>({
    key: 'dashboardFilterCrossFilterValuesComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
