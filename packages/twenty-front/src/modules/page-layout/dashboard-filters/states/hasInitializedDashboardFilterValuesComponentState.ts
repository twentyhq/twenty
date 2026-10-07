import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Charts and the reset button wait on this so the first paint never shows empty-value state that the initializer replaces a moment later.
export const hasInitializedDashboardFilterValuesComponentState =
  createAtomComponentState<boolean>({
    key: 'hasInitializedDashboardFilterValuesComponentState',
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
