import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// The tab whose chart set the current cross-filters; leaving it is what clears them.
export const dashboardFilterCrossFilterTabIdComponentState =
  createAtomComponentState<string | null>({
    key: 'dashboardFilterCrossFilterTabIdComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
