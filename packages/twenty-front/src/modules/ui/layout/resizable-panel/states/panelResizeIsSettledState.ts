import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// True while no horizontal panel edge (navigation drawer, side panel) is being
// dragged. Width-dependent layouts subscribe to recompute once a drag settles.
export const panelResizeIsSettledState = createAtomState<boolean>({
  key: 'panelResizeIsSettledState',
  defaultValue: true,
});
