import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const sidePanelSearchState = createAtomState<string>({
  key: 'side-panel/sidePanelSearchState',
  defaultValue: '',
});
