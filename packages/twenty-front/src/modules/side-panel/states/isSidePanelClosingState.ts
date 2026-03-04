import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isSidePanelClosingState = createAtomState({
  key: 'command-menu/isSidePanelClosingState',
  defaultValue: false,
});
