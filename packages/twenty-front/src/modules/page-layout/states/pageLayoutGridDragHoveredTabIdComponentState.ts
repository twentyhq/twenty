import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Tab hovered by a react-grid-layout widget drag; grid drags never enter
// dnd-kit, so the tab highlight is driven through this state instead.
export const pageLayoutGridDragHoveredTabIdComponentState =
  createAtomComponentState<string | null>({
    key: 'pageLayoutGridDragHoveredTabIdComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
