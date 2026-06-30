import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sidePanelSearchObjectFilterState = createAtomState<string | null>({
  key: 'side-panel/sidePanelSearchObjectFilterState',
  defaultValue: null,
});
