import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// A grid drop routed to another tab rebuilds both tabs' layouts itself; the
// grid's own post-drag layout commit must be skipped once so it does not
// overwrite the cross-tab move.
export const pageLayoutShouldIgnoreNextGridLayoutChangeComponentState =
  createAtomComponentState<boolean>({
    key: 'pageLayoutShouldIgnoreNextGridLayoutChangeComponentState',
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
