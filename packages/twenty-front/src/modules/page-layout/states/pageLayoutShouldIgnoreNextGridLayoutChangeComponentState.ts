import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// A cross-tab grid drop rebuilds both layouts itself, so the grid's own post-drag commit is skipped once.
export const pageLayoutShouldIgnoreNextGridLayoutChangeComponentState =
  createAtomComponentState<boolean>({
    key: 'pageLayoutShouldIgnoreNextGridLayoutChangeComponentState',
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
