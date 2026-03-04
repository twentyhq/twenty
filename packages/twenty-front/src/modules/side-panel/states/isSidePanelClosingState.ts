import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isSidePanelClosingState = createAtomState({
  key: 'side-panel/isSidePanelClosingState',
  defaultValue: false,
});
