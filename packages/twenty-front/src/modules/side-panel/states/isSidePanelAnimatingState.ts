import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isSidePanelAnimatingState = createAtomState<boolean>({
  key: 'side-panel/isSidePanelAnimatingState',
  defaultValue: false,
});
