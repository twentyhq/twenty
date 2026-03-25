import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isSidePanelOpenedState = createAtomState<boolean>({
  key: 'side-panel/isSidePanelOpenedState',
  defaultValue: false,
});
