import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Grid drags never enter dnd-kit, so the tab highlight is driven through this state.
export const pageLayoutGridDragHoveredTabIdComponentState =
  createAtomComponentState<string | null>({
    key: 'pageLayoutGridDragHoveredTabIdComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
