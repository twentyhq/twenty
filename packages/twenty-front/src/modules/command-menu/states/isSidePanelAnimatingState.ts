import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isSidePanelAnimatingState = createAtomState<boolean>({
  key: 'command-menu/isSidePanelAnimatingState',
  defaultValue: false,
});
