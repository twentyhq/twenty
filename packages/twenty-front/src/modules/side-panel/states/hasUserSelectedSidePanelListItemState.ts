import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const hasUserSelectedSidePanelListItemState = createAtomState({
  key: 'hasUserSelectedSidePanelListItemState',
  defaultValue: false,
});
