import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sidePanelShowHiddenObjectsState = createAtomState<boolean>({
  key: 'side-panel/sidePanelShowHiddenObjectsState',
  defaultValue: false,
});
